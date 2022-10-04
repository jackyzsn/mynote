import { openDatabase } from 'react-native-sqlite-storage';
import RNFetchBlob from 'rn-fetch-blob';
import moment from 'moment';
import { Platform } from 'react-native';

let db = openDatabase({ name: 'MyNote.db' });

export function createTable() {
  db.transaction(function (trans) {
    trans.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='tbl_notes'", [], (tx, results) => {
      if (results.rows.length === 0) {
        tx.executeSql('DROP TABLE IF EXISTS tbl_notes', []);
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS tbl_notes(id INTEGER PRIMARY KEY AUTOINCREMENT, note_group VARCHAR(255), note_tag VARCHAR(255), updt VARCHAR(64), note_text VARCHAR(10240000))',
          []
        );
      }
    });
  });
}

export function insertNote(notegroup, notetag, noteText, callback) {
  if (noteText) {
    db.transaction(function (trans) {
      trans.executeSql(
        'SELECT id from tbl_notes where note_group = ? and note_tag = ?',
        [notegroup, notetag],
        (tx, results) => {
          if (results.rows.length > 0) {
            // note_tag exists..
            callback('10');
          } else {
            let now = new moment();
            let nowString = now.format('YYYY-MM-DDTHH:mm:ss.SSS');

            tx.executeSql(
              'INSERT into tbl_notes (note_group, note_tag, updt, note_text) values (?,?,?,?)',
              [notegroup, notetag, nowString, noteText],
              (tx, results) => {
                if (results.rowsAffected > 0) {
                  callback('00');
                } else {
                  callback('99');
                }
              }
            );
          }
        }
      );
    });
  }
}

export function retrieveAllNotes(notegroup, callback) {
  db.transaction(function (trans) {
    trans.executeSql(
      'SELECT id, note_group, note_tag, updt  from tbl_notes where note_group = ? order by id desc',
      [notegroup],
      (tx, results) => {
        let noteList = [];

        if (results.rows.length > 0) {
          // has result
          for (let i = 0; i < results.rows.length; i++) {
            let rec = {};
            rec.id = results.rows.item(i).id;
            rec.note_tag = results.rows.item(i).note_tag;
            rec.updt = results.rows.item(i).updt;
            noteList.push(rec);
          }
        }

        callback(noteList);
      }
    );
  });
}

export function retrieveNoteDetail(id, callback) {
  db.transaction(function (trans) {
    trans.executeSql('SELECT note_text from tbl_notes where id = ?', [id], (tx, results) => {
      if (results.rows.length > 0) {
        // has result
        callback('00', results.rows.item(0).note_text);
      } else {
        callback('99', '');
      }
    });
  });
}

export function deleteNotes(list, callback) {
  let delString;

  if (list.length > 1) {
    let inString = '?,'.repeat(list.length - 1);
    inString = inString + '?';
    delString = 'DELETE from tbl_notes where id in (' + inString + ') ';
  } else {
    delString = 'DELETE from tbl_notes where id = ?';
  }

  db.transaction(function (trans) {
    trans.executeSql(delString, [...list], (tx, results) => {
      if (results.rowsAffected > 0) {
        // success
        callback('00', list);
      } else {
        callback('99', list);
      }
    });
  });
}

export function updateNote(id, noteText, callback) {
  let updString = 'UPDATE tbl_notes set note_text = ?, updt = ? where id = ?';
  let now = new moment();
  let nowString = now.format('YYYY-MM-DDTHH:mm:ss.SSS');

  db.transaction(function (trans) {
    trans.executeSql(updString, [noteText, nowString, id], (tx, results) => {
      if (results.rowsAffected > 0) {
        // success
        callback('00');
      } else {
        callback('99');
      }
    });
  });
}

export function searchTextAllNotes(notegroup, searchText, key, decrypt, callback) {
  db.transaction(function (trans) {
    trans.executeSql(
      'SELECT id, note_group, note_tag, updt, note_text  from tbl_notes where note_group = ? order by id desc',
      [notegroup],
      (tx, results) => {
        let noteList = [];
        if (results.rows.length > 0) {
          // has result
          for (let i = 0; i < results.rows.length; i++) {
            let decryptedText = decrypt(results.rows.item(i).note_text, key);

            if (decryptedText.toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
              let rec = {};
              rec.id = results.rows.item(i).id;
              rec.note_tag = results.rows.item(i).note_tag;
              rec.updt = results.rows.item(i).updt;
              noteList.push(rec);
            }
          }
        }
        callback(noteList);
      }
    );
  });
}

export function exportToFile(list, key, decrypt, callback) {
  let sqlString;
  if (list.length > 1) {
    let inString = '?,'.repeat(list.length - 1);
    inString = inString + '?';
    sqlString = 'SELECT id, note_group, note_tag, updt, note_text from tbl_notes where id in (' + inString + ') ';
  } else {
    sqlString = 'SELECT id, note_group, note_tag, updt, note_text from tbl_notes where id = ?';
  }

  db.transaction(function (trans) {
    trans.executeSql(sqlString, [...list], (tx, results) => {
      let notes = {};

      if (results.rows.length > 0) {
        notes.noteGroup = results.rows.item(0).note_group;

        let noteList = [];
        // has result
        for (let i = 0; i < results.rows.length; i++) {
          let note = {};
          note.id = results.rows.item(i).id;
          note.noteTag = results.rows.item(i).note_tag;
          note.updateTime = results.rows.item(i).updt;
          let decryptedText = decrypt(results.rows.item(i).note_text, key);
          if (decryptedText === '') {
            note.noteText = results.rows.item(i).note_text;
          } else {
            note.noteText = decryptedText;
          }
          noteList.push(note);
        }
        notes.noteList = noteList;

        let now = new moment();
        let nowString = now.format('YYYY-MM-DDTHHmmss');
        const dirs = RNFetchBlob.fs.dirs;

        let path = Platform.OS === 'android' ? dirs.DownloadDir : dirs.DocumentDir;
        let fullPath = path + '/MyNotes_' + nowString + '.json';

        let noteString = JSON.stringify(notes, null, 2);

        // write the file
        RNFetchBlob.fs
          .createFile(
            fullPath,
            noteString,
            // encoding, should be one of `base64`, `utf8`, `ascii`
            'utf8'
          )
          .then(result => {
            callback('00', fullPath);
          })
          .catch(err => callback('20', ''));
      } else {
        callback('10', '');
      }
    });
  });
}

export function fileIsValid(fileContent) {
  try {
    let notes = JSON.parse(fileContent);

    let noteList = notes.noteList;

    if (noteList && noteList.length > 0) {
      for (let i = 0; i < noteList.length; i++) {
        let noteTag = noteList[i].noteTag;
        let noteText = noteList[i].noteText;
        if (!noteTag || !noteText || noteTag.trim() === '' || noteText.trim() === '') {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}

export function importFromFile(notegroup, noteList, key, encrypt, callback) {
  try {
    let now = new moment();
    let nowString = now.format('YYYY-MM-DDTHH:mm:ss.SSS');

    let vals = [];
    let symbols = '';
    for (let i = 0; i < noteList.length; i++) {
      let noteTag = noteList[i].noteTag;

      let noteText = encrypt(noteList[i].noteText, key);

      vals.push(notegroup);
      vals.push(noteTag);
      vals.push(nowString);
      vals.push(noteText);

      if (i === 0) {
        symbols = symbols + '(?,?,?,?)';
      } else {
        symbols = symbols + ',(?,?,?,?)';
      }
    }

    db.transaction(function (trans) {
      trans.executeSql(
        'INSERT into tbl_notes (note_group, note_tag, updt, note_text) values ' + symbols,
        [...vals],
        (tx, results) => {
          if (results.rowsAffected === 0) {
            throw 'Failed to insert';
          }
        }
      );
    });

    callback('00');
  } catch (ex) {
    callback('99');
  }
}
