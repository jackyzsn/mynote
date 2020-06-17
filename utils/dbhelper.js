import { openDatabase } from "react-native-sqlite-storage";
import { encrypt, decrypt } from "./crypto";
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
    console.log("Note group:" + notegroup);
    console.log("Note group:" + notetag);
    db.transaction(function(tx) {
      tx.executeSql(
        "SELECT id from tbl_notes where note_group = ? and note_tag = ?",
        [notegroup, notetag],
        (tx, results) => {
          console.log(JSON.stringify(results));
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
