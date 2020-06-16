import { openDatabase } from "react-native-sqlite-storage";
import moment from "moment";

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
            "CREATE TABLE IF NOT EXISTS tbl_notes(id INTEGER PRIMARY KEY AUTOINCREMENT, note_tag VARCHAR(255), seq INT, updt VARCHAR(64), note_text VARCHAR(10240000))",
            []
          );
        }
      }
    );
  });
}

export function insertNote(notetag, noteText, callback) {
  if (noteText) {
    db.transaction(function(tx) {
      tx.executeSql(
        "SELECT max(seq) as seq from tbl_notes where note_tag = ?",
        [notetag],
        (tx, results) => {
          var nextSeq;
          if (results.rows.length === 1) {
            nextSeq = results.rows.item(0).seq + 1;
          } else {
            nextSeq = 1;
          }

          var now = new moment();
          var nowString = now.format("YYYY-MM-DDTHH:mm:ss.SSS");

          tx.executeSql(
            "INSERT into tbl_notes (note_tag, seq, updt, note_text) values (?,?,?,?)",
            [notetag, nextSeq, nowString, noteText],
            (tx, results) => {
              if (results.rowsAffected > 0) {
                callback("success");
              } else {
                callback("failed");
              }
            }
          );
        }
      );
    });
  }
}

export function retrieveAllNotes(notetag, callback) {
  db.transaction(function(tx) {
    tx.executeSql(
      "SELECT id, note_tag, seq, updt  from tbl_notes where note_tag = ? order by id desc",
      [notetag],
      (tx, results) => {
        var noteList = [];
        if (results.rows.length > 0) {
          // has result
          for (i = 0; i < results.rows.length; i++) {
            var rec = {};
            rec.id = results.rows.item(i).id;
            rec.note_tag = results.rows.item(i).note_tag;
            rec.seq = results.rows.item(i).seq;
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
      "SELECT id, note_text from tbl_notes where id = ?",
      [id],
      (tx, results) => {
        var rec = {};
        if (results.rows.length > 0) {
          // has result
          rec.id = results.rows.item(0).id;
          rec.note_text = results.rows.item(0).note_text;
        }
        callback(rec);
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
        callback("success", list);
      } else {
        callback("failed", list);
      }
    });
  });
}
