import { openDatabase } from "react-native-sqlite-storage";

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

export function insertNote(notetag, noteText, callback, navigation) {
  console.log("db navigation: " + navigation);
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

          var now = new Date();
          var nowString = now.toISOString();

          tx.executeSql(
            "INSERT into tbl_notes (note_tag, seq, updt, note_text) values (?,?,?,?)",
            [notetag, nextSeq, nowString, noteText],
            (tx, results) => {
              if (results.rowsAffected > 0) {
                callback("success", navigation);
              } else {
                callback("failed", navigation);
              }
            }
          );
        }
      );
    });
  }
}
