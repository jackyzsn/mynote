import { openDatabase } from "react-native-sqlite-storage";
import RNFetchBlob from "rn-fetch-blob";
import moment from "moment";
import { Platform } from "react-native";

var db = openDatabase({ name: "MyNote.db" });

export function createTable() {
  db.transaction(function(tx) {
    tx.executeSql(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='tbl_notes'",
      [],
      (tx, results) => {
        if (results.rows.length == 0) {
          tx.executeSql("DROP TABLE IF EXISTS tbl_notes", []);
          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS tbl_notes(id INTEGER PRIMARY KEY AUTOINCREMENT, note_group VARCHAR(255), note_tag VARCHAR(255), updt VARCHAR(64), note_text VARCHAR(10240000))",
            []
          );
        }
      }
    );
  });
}

export function insertNote(notegroup, notetag, noteText, callback) {
  if (noteText) {
    db.transaction(function(tx) {
      tx.executeSql(
        "SELECT id from tbl_notes where note_group = ? and note_tag = ?",
        [notegroup, notetag],
        (tx, results) => {
          if (results.rows.length > 0) {
            // note_tag exists..
            callback("10");
          } else {
            var now = new moment();
            var nowString = now.format("YYYY-MM-DDTHH:mm:ss.SSS");

            tx.executeSql(
              "INSERT into tbl_notes (note_group, note_tag, updt, note_text) values (?,?,?,?)",
              [notegroup, notetag, nowString, noteText],
              (tx, results) => {
                if (results.rowsAffected > 0) {
                  callback("00");
                } else {
                  callback("99");
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
  db.transaction(function(tx) {
    tx.executeSql(
      "SELECT id, note_group, note_tag, updt  from tbl_notes where note_group = ? order by id desc",
      [notegroup],
      (tx, results) => {
        var noteList = [];

        if (results.rows.length > 0) {
          // has result
          for (i = 0; i < results.rows.length; i++) {
            var rec = {};
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
  db.transaction(function(tx) {
    tx.executeSql(
      "SELECT note_text from tbl_notes where id = ?",
      [id],
      (tx, results) => {
        if (results.rows.length > 0) {
          // has result
          callback("00", results.rows.item(0).note_text);
        } else {
          callback("99", "");
        }
      }
    );
  });
}

export function deleteNotes(list, callback) {
  var delString;

  if (list.length > 1) {
    var inString = "?,".repeat(list.length - 1);
    inString = inString + "?";
    delString = "DELETE from tbl_notes where id in (" + inString + ") ";
  } else {
    delString = "DELETE from tbl_notes where id = ?";
  }

  db.transaction(function(tx) {
    tx.executeSql(delString, [...list], (tx, results) => {
      if (results.rowsAffected > 0) {
        // success
        callback("00", list);
      } else {
        callback("99", list);
      }
    });
  });
}

export function updateNote(id, noteText, callback) {
  var updString = "UPDATE tbl_notes set note_text = ?, updt = ? where id = ?";
  var now = new moment();
  var nowString = now.format("YYYY-MM-DDTHH:mm:ss.SSS");

  db.transaction(function(tx) {
    tx.executeSql(updString, [noteText, nowString, id], (tx, results) => {
      if (results.rowsAffected > 0) {
        // success
        callback("00");
      } else {
        callback("99");
      }
    });
  });
}

export function searchTextAllNotes(
  notegroup,
  searchText,
  key,
  decrypt,
  callback
) {
  db.transaction(function(tx) {
    tx.executeSql(
      "SELECT id, note_group, note_tag, updt, note_text  from tbl_notes where note_group = ? order by id desc",
      [notegroup],
      (tx, results) => {
        var noteList = [];
        if (results.rows.length > 0) {
          // has result
          for (i = 0; i < results.rows.length; i++) {
            var decryptedText = decrypt(results.rows.item(i).note_text, key);
            if (decryptedText.indexOf(searchText) > -1) {
              var rec = {};
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
  var sqlString;
  if (list.length > 1) {
    var inString = "?,".repeat(list.length - 1);
    inString = inString + "?";
    sqlString =
      "SELECT id, note_group, note_tag, updt, note_text from tbl_notes where id in (" +
      inString +
      ") ";
  } else {
    sqlString =
      "SELECT id, note_group, note_tag, updt, note_text from tbl_notes where id = ?";
  }

  db.transaction(function(tx) {
    tx.executeSql(sqlString, [...list], (tx, results) => {
      var notes = {};

      if (results.rows.length > 0) {
        notes.noteGroup = results.rows.item(0).note_group;

        var noteList = [];
        // has result
        for (i = 0; i < results.rows.length; i++) {
          var note = {};
          note.id = results.rows.item(i).id;
          note.noteTag = results.rows.item(i).note_tag;
          note.updateTime = results.rows.item(i).updt;
          var decryptedText = decrypt(results.rows.item(i).note_text, key);
          if (decryptedText === "") {
            note.noteText = results.rows.item(i).note_text;
          } else {
            note.noteText = decryptedText;
          }
          noteList.push(note);
        }
        notes.noteList = noteList;

        var now = new moment();
        var nowString = now.format("YYYY-MM-DDTHHmmss");
        const dirs = RNFetchBlob.fs.dirs;

        var path =
          Platform.OS === "android" ? dirs.DownloadDir : dirs.DocumentDir;
        var fullPath = path + "/MyNotes_" + nowString + ".json";

        var noteString = JSON.stringify(notes, null, 2);

        // write the file
        RNFetchBlob.fs
          .createFile(
            fullPath,
            noteString,
            // encoding, should be one of `base64`, `utf8`, `ascii`
            "utf8"
          )
          .then((result) => {
            callback("00", fullPath);
          })
          .catch((err) => callback("20", ""));
      } else {
        callback("10", "");
      }
    });
  });
}

export function fileIsValid(fileContent) {
  try {
    var notes = JSON.parse(fileContent);

    var noteList = notes.noteList;

    if (noteList && noteList.length > 0) {
      for (i = 0; i < noteList.length; i++) {
        var noteTag = noteList[i].noteTag;
        var noteText = noteList[i].noteText;
        if (
          !noteTag ||
          !noteText ||
          noteTag.trim() === "" ||
          noteText.trim() === ""
        ) {
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
    var now = new moment();
    var nowString = now.format("YYYY-MM-DDTHH:mm:ss.SSS");

    for (i = 0; i < noteList.length; i++) {
      var noteTag = noteList[i].noteTag;
      var noteText = encrypt(noteList[i].noteText, key);

      db.transaction(function(tx) {
        tx.executeSql(
          "INSERT into tbl_notes (note_group, note_tag, updt, note_text) values (?,?,?,?)",
          [notegroup, noteTag, nowString, noteText],
          (tx, results) => {
            if (results.rowsAffected === 0) {
              throw "Failed to insert";
            }
          }
        );
      });
    }
    callback("00");
  } catch (ex) {
    callback("99");
  }
}
