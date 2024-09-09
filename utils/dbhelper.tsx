import SQLite, { Transaction, ResultSet } from 'react-native-sqlite-storage';
import UUIDGenerator from 'react-native-uuid-generator';
import RNFS from 'react-native-fs';
import moment from 'moment';
import { Platform } from 'react-native';
import setting from '../setting.json';
import { NoteItemType, NoteItemTextType, BackupType, NoteType } from '../@types/mynote.d';

let db = SQLite.openDatabase({ name: 'MyNote_v2.db' });

const mynote = 'mynote';
const mynoteIndex = 'mynote_index';

export async function createTable(): Promise<void> {
    (await db).transaction((trans: Transaction) => {
        trans.executeSql(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='tbl_notes'",
            [],
            (tx: Transaction, results: ResultSet) => {
                if (results.rows.length === 0) {
                    tx.executeSql('DROP TABLE IF EXISTS tbl_notes', []);
                    tx.executeSql(
                        'CREATE TABLE IF NOT EXISTS tbl_notes(id INTEGER PRIMARY KEY AUTOINCREMENT, note_group VARCHAR(255), note_tag VARCHAR(255), updt VARCHAR(64), note_text VARCHAR(10240000), delete_key VARCHAR(255))',
                        []
                    );
                }
            }
        );
    });
}

export async function insertNote(
    notegroup: string,
    notetag: string,
    noteText: string,
    deleteKey: string,
    callback: (code: string) => void
): Promise<void> {
    if (noteText) {
        (await (db)).transaction((trans: Transaction) => {
            trans.executeSql(
                'SELECT id from tbl_notes where note_group = ? and note_tag = ? and delete_key = ?',
                [notegroup, notetag, deleteKey],
                (tx: Transaction, results: ResultSet) => {
                    if (results.rows.length > 0) {
                        callback('10'); // note_tag exists
                    } else {
                        let now = moment();
                        let nowString = now.format('YYYY-MM-DDTHH:mm:ss.SSS');

                        tx.executeSql(
                            'INSERT into tbl_notes (note_group, note_tag, updt, note_text, delete_key) values (?,?,?,?,?)',
                            [notegroup, notetag, nowString, noteText, deleteKey],
                            (tx1: Transaction, results1: ResultSet) => {
                                if (results1.rowsAffected > 0) {
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

export async function retrieveAllNotes(
    notegroup: string,
    deleteKey: string,
    callback: (noteList: Array<NoteItemType>) => void
): Promise<void> {
    (await db).transaction((trans: Transaction) => {
        trans.executeSql(
            'SELECT id, note_group, note_tag, updt from tbl_notes where note_group = ? and delete_key = ? order by id desc',
            [notegroup, deleteKey],
            (tx: Transaction, results: ResultSet) => {
                let noteList: Array<NoteItemType> = [];

                if (results.rows.length > 0) {
                    for (let i = 0; i < results.rows.length; i++) {
                        noteList.push({
                            id: results.rows.item(i).id,
                            note_tag: results.rows.item(i).note_tag,
                            updt: results.rows.item(i).updt,
                        });
                    }
                }

                callback(noteList);
            }
        );
    });
}

export async function retrieveNoteDetail(
    id: number,
    callback: (code: string, noteText: string) => void
): Promise<void> {
    (await db).transaction((trans: Transaction) => {
        trans.executeSql(
            'SELECT note_text from tbl_notes where id = ?',
            [id],
            (tx: Transaction, results: ResultSet) => {
                if (results.rows.length > 0) {
                    callback('00', results.rows.item(0).note_text);
                } else {
                    callback('99', '');
                }
            }
        );
    });
}

export async function deleteNotes(
    list: number[],
    callback: (code: string, list: number[]) => void
): Promise<void> {
    let delString: string;

    if (list.length > 1) {
        let inString = '?,'.repeat(list.length - 1) + '?';
        delString = `DELETE from tbl_notes where id in (${inString}) `;
    } else {
        delString = 'DELETE from tbl_notes where id = ?';
    }

    (await db).transaction((trans: Transaction) => {
        trans.executeSql(delString, [...list], (tx: Transaction, results: ResultSet) => {
            if (results.rowsAffected > 0) {
                callback('00', list);
            } else {
                callback('99', list);
            }
        });
    });
}

export async function updateNote(
    id: number,
    noteText: string,
    callback: (code: string) => void
): Promise<void> {
    let updString = 'UPDATE tbl_notes set note_text = ?, updt = ? where id = ?';
    let now = moment();
    let nowString = now.format('YYYY-MM-DDTHH:mm:ss.SSS');

    (await db).transaction((trans: Transaction) => {
        trans.executeSql(updString, [noteText, nowString, id], (tx: Transaction, results: ResultSet) => {
            if (results.rowsAffected > 0) {
                callback('00');
            } else {
                callback('99');
            }
        });
    });
}

export async function searchTextAllNotes(
    notegroup: string,
    searchText: string,
    key: string,
    decrypt: (text: string, key: string) => string,
    callback: (noteList: Array<NoteItemType>) => void
): Promise<void> {
    (await db).transaction((trans: Transaction) => {
        trans.executeSql(
            'SELECT id, note_group, note_tag, updt, note_text from tbl_notes where note_group = ? order by id desc',
            [notegroup],
            (tx: Transaction, results: ResultSet) => {
                let noteList: Array<NoteItemType> = [];

                if (results.rows.length > 0) {
                    for (let i = 0; i < results.rows.length; i++) {
                        let decryptedText = decrypt(results.rows.item(i).note_text, key);

                        if (decryptedText.toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
                            noteList.push({
                                id: results.rows.item(i).id,
                                note_tag: results.rows.item(i).note_tag,
                                updt: results.rows.item(i).updt,
                            });
                        }
                    }
                }

                callback(noteList);
            }
        );
    });
}

export async function exportToFile(
    list: number[],
    key: string,
    decrypt: (text: string, key: string) => string,
    callback: (code: string, fullPath: string) => void
): Promise<void> {
    let sqlString: string;

    if (list.length > 1) {
        let inString = '?,'.repeat(list.length - 1) + '?';
        sqlString = `SELECT id, note_group, note_tag, updt, note_text from tbl_notes where id in (${inString}) `;
    } else {
        sqlString = 'SELECT id, note_group, note_tag, updt, note_text from tbl_notes where id = ?';
    }

    (await db).transaction((trans: Transaction) => {
        trans.executeSql(sqlString, [...list], (tx: Transaction, results: ResultSet) => {
            let notes: any = {};

            if (results.rows.length > 0) {
                notes.noteGroup = results.rows.item(0).note_group;

                let noteList: Array<NoteItemTextType> = [];

                for (let i = 0; i < results.rows.length; i++) {
                    let note: NoteItemTextType = {
                        id: results.rows.item(i).id,
                        noteTag: results.rows.item(i).note_tag,
                        updateTime: results.rows.item(i).updt,
                        noteText: decrypt(results.rows.item(i).note_text, key) || results.rows.item(i).note_text,
                    };
                    noteList.push(note);
                }
                notes.noteList = noteList;

                let nowString = moment().format('YYYY-MM-DDTHHmmss');
                let savedPath = Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.DownloadDirectoryPath;
                let fullPath = `${savedPath}/MyNotes_${nowString}.json`;

                RNFS.writeFile(fullPath, JSON.stringify(notes, null, 2), 'utf8')
                    .then(() => callback('00', fullPath))
                    .catch(() => callback('99', ''));
            } else {
                callback('10', '');
            }
        });
    });
}

export function fileIsValid(fileContent: string): boolean {
    try {
        let notes = JSON.parse(fileContent);
        let noteList = notes.noteList;

        if (noteList && noteList.length > 0) {
            for (let note of noteList) {
                let noteTag = note.noteTag;
                let noteText = note.noteText;
                if (!noteTag || !noteText || noteTag.trim() === '' || noteText.trim() === '') {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    } catch (err) {
        return false;
    }
}

export async function importFromFile(
    notegroup: string,
    noteList: NoteType[],
    key: string,
    encrypt: (text: string, key: string) => string,
    deleteKey: string,
    callback: (resultCode: string) => void,
): Promise<void> {
    try {
        let now = moment(); // Ensure you have imported moment
        let nowString = now.format('YYYY-MM-DDTHH:mm:ss.SSS');

        let vals: string[] = [];
        let symbols = '';

        for (let i = 0; i < noteList.length; i++) {
            let noteTag = noteList[i].noteTag;
            let noteText = encrypt(noteList[i].noteText, key);

            vals.push(notegroup);
            vals.push(noteTag);
            vals.push(nowString);
            vals.push(noteText);
            vals.push(deleteKey);

            symbols += i === 0 ? '(?,?,?,?,?)' : ',(?,?,?,?,?)';
        }

        // db is assumed to be a globally available database instance
        (await db).transaction((trans: Transaction) => {
            trans.executeSql(
                'INSERT INTO tbl_notes (note_group, note_tag, updt, note_text, delete_key) VALUES ' + symbols,
                vals,
                (tx: Transaction, results: ResultSet) => {
                    if (results.rowsAffected === 0) {
                        callback('99');
                        console.log('Failed to insert');
                    } else {
                        callback('00');
                    }
                },
                (tx: Transaction, error: any) => {
                    console.log('Error occurred: ', error);
                    callback('99');
                }
            );
        });
    } catch (ex) {
        console.log(ex);
        callback('99');
    }
}

export async function syncToCloud(
    deviceId: string,
    userAgent: string,
    callback: (code: string) => void
): Promise<void> {
    (await db).transaction((trans: Transaction) => {
        trans.executeSql(
            'SELECT id, note_group, note_tag, note_text, delete_key, updt from tbl_notes order by id',
            [],
            (tx: Transaction, results: ResultSet) => {
                let noteList: Array<any> = [];

                if (results.rows.length > 0) {
                    for (let i = 0; i < results.rows.length; i++) {
                        let rec: any = {};
                        rec.id = results.rows.item(i).id;
                        rec.note_tag = results.rows.item(i).note_tag;
                        rec.updt = results.rows.item(i).updt;
                        rec.note_content = results.rows.item(i).note_text;
                        rec.note_group = results.rows.item(i).note_group;
                        rec.delete_key = results.rows.item(i).delete_key;
                        noteList.push(rec);
                    }
                }

                let now = moment();
                let nowString = now.format('YYYY-MM-DDTHH:mm:ss.SSS');
                UUIDGenerator.getRandomUUID().then(uid => {
                    fetch(`${setting.backupURL}${mynote}/items`, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            'X-Api-Key': setting.backupAPIKey,
                        },
                        body: JSON.stringify({
                            item: {
                                uuid: uid,
                                agent: userAgent,
                                content: JSON.stringify(noteList),
                            },
                        }),
                    })
                        .then(_response => {
                            callback('00');
                            fetch(`${setting.backupURL}${mynoteIndex}/items`, {
                                method: 'POST',
                                headers: {
                                    Accept: 'application/json',
                                    'Content-Type': 'application/json',
                                    'X-Api-Key': setting.backupAPIKey,
                                },
                                body: JSON.stringify({
                                    item: {
                                        uuid: uid,
                                        device: deviceId,
                                        updt: nowString,
                                    },
                                }),
                            });
                        })
                        .catch(error => {
                            console.error(error);
                            callback('99');
                        });
                });
            }
        );
    });
}


export function retrieveBackups(
    callback: (backupList: Array<BackupType>) => void,
    showError: () => void
): void {
    fetch(`${setting.backupURL}${mynoteIndex}/query`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Api-Key': setting.backupAPIKey,
        },
        body: JSON.stringify({
            query: [],
        }),
    })
        .then(response => {
            if (!response.ok) {
                showError();
                console.error('HTTP error ' + response.status);
            }
            return response.json();
        })
        .then(json => {
            let backupList = json.items.map((item: any) => ({
                uuid: item.uuid,
                device: item.device,
                backupAt: item.updt,
            }));

            backupList.sort((a: BackupType, b: BackupType) => {
                if (b.backupAt > a.backupAt) {
                    return 1;
                }
                if (a.backupAt > b.backupAt) {
                    return -1;
                }
                return 0;
            });

            callback(backupList);
        })
        .catch(error => {
            console.error(error);
            showError();
            callback([]);
        });
}

export function restoreToDB(
    uuid: string,
    callback: (code: string) => void
): void {
    fetch(`${setting.backupURL}${mynote}/query`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Api-Key': setting.backupAPIKey,
        },
        body: JSON.stringify({
            query: [{ uuid: uuid }],
        }),
    })
        .then(response => {
            if (!response.ok) {
                callback('99');
                console.error('HTTP error ' + response.status);
            }
            return response.json();
        })
        .then(async json => {
            let notes = JSON.parse(json.items[0].content);

            (await db).transaction((trans: Transaction) => {
                trans.executeSql('DELETE from tbl_notes', []);
                let symbols = '';
                let vals: Array<string | number> = [];
                for (let i = 0; i < notes.length; i++) {
                    let noteTag = notes[i].note_tag;
                    let noteContent = notes[i].note_content;
                    let noteGroup = notes[i].note_group;
                    let deleteKey = notes[i].delete_key;
                    let updt = notes[i].updt;
                    vals.push(noteGroup, noteTag, updt, noteContent, deleteKey);
                    symbols += i === 0 ? '(?,?,?,?,?)' : ',(?,?,?,?,?)';
                }
                trans.executeSql(
                    'INSERT into tbl_notes (note_group, note_tag, updt, note_text, delete_key) values ' + symbols,
                    [...vals],
                    (tx: Transaction, results: ResultSet) => {
                        if (results.rowsAffected === 0) {
                            callback('99');
                            console.log('Failed to insert');
                        } else {
                            callback('00');
                        }
                    }
                );
            });
        })
        .catch(error => {
            console.error(error);
            callback('99');
        });
}

export async function syncToMongo(
    deviceId: string,
    userAgent: string,
    callback: (code: string) => void
): Promise<void> {
    (await db).transaction((trans: Transaction) => {
        trans.executeSql(
            'SELECT id, note_group, note_tag, note_text, delete_key, updt from tbl_notes order by id',
            [],
            (tx: Transaction, results: ResultSet) => {
                let noteList: Array<any> = [];

                if (results.rows.length > 0) {
                    for (let i = 0; i < results.rows.length; i++) {
                        let rec: any = {};
                        rec.id = results.rows.item(i).id;
                        rec.note_tag = results.rows.item(i).note_tag;
                        rec.updt = results.rows.item(i).updt;
                        rec.note_content = results.rows.item(i).note_text;
                        rec.note_group = results.rows.item(i).note_group;
                        rec.delete_key = results.rows.item(i).delete_key;
                        noteList.push(rec);
                    }
                }

                let now = moment();
                let nowString = now.format('YYYY-MM-DDTHH:mm:ss.SSS');
                UUIDGenerator.getRandomUUID().then(uid => {
                    fetch(`${setting.mongodb.backupURL}/insertOne`, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            'apiKey': setting.mongodb.apiKey,
                        },
                        body: JSON.stringify({
                            dataSource: setting.mongodb.dataSource,
                            database: setting.mongodb.database,
                            collection: setting.mongodb.collection,
                            document: {
                                uuid: uid,
                                agent: userAgent,
                                content: JSON.stringify(noteList),
                                device: deviceId,
                                updt: nowString,
                            },
                        }),
                    })
                        .then(_response => {
                            callback('00');
                        })
                        .catch(error => {
                            console.error(error);
                            callback('99');
                        });
                });
            }
        );
    });
}

export function retrieveBackupsMongo(
    callback: (backupList: Array<BackupType>) => void,
    showError: () => void
): void {
    fetch(`${setting.mongodb.backupURL}/find`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'apiKey': setting.mongodb.apiKey,
        },
        body: JSON.stringify({
            dataSource: setting.mongodb.dataSource,
            database: setting.mongodb.database,
            collection: setting.mongodb.collection,
            projection: { uuid: 1, device: 1, updt: 1 },
            sort: {
                updt: -1,
            },
        }),
    })
        .then(response => {
            if (!response.ok) {
                showError();
                console.error('HTTP error ' + response.status);
            }
            return response.json();
        })
        .then(json => {
            let backupList = json.documents.map((item: any) => ({
                uuid: item.uuid,
                device: item.device,
                backupAt: item.updt,
            }));

            backupList.sort((a: BackupType, b: BackupType) => {
                if (b.backupAt > a.backupAt) {
                    return 1;
                }
                if (a.backupAt > b.backupAt) {
                    return -1;
                }
                return 0;
            });

            callback(backupList);
        })
        .catch(error => {
            console.error(error);
            showError();
            callback([]);
        });
}

export function restoreToDBMongo(
    uuid: string,
    callback: (code: string) => void
): void {
    fetch(`${setting.mongodb.backupURL}/findOne`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'apiKey': setting.mongodb.apiKey,
        },
        body: JSON.stringify({
            dataSource: setting.mongodb.dataSource,
            database: setting.mongodb.database,
            collection: setting.mongodb.collection,
            filter: {
                uuid,
            },
        }),
    })
        .then(response => {
            if (!response.ok) {
                callback('99');
                console.error('HTTP error ' + response.status);
            }
            return response.json();
        })
        .then(async json => {
            let notes = JSON.parse(json.document.content);

            (await db).transaction((trans: Transaction) => {
                trans.executeSql('DELETE from tbl_notes', []);
                let symbols = '';
                let vals: Array<string | number> = [];
                for (let i = 0; i < notes.length; i++) {
                    let noteTag = notes[i].note_tag;
                    let noteContent = notes[i].note_content;
                    let noteGroup = notes[i].note_group;
                    let deleteKey = notes[i].delete_key;
                    let updt = notes[i].updt;
                    vals.push(noteGroup, noteTag, updt, noteContent, deleteKey);
                    symbols += i === 0 ? '(?,?,?,?,?)' : ',(?,?,?,?,?)';
                }
                trans.executeSql(
                    'INSERT into tbl_notes (note_group, note_tag, updt, note_text, delete_key) values ' + symbols,
                    [...vals],
                    (tx: Transaction, results: ResultSet) => {
                        if (results.rowsAffected === 0) {
                            callback('99');
                            console.log('Failed to insert');
                        } else {
                            callback('00');
                        }
                    }
                );
            });
        })
        .catch(error => {
            console.error(error);
            callback('99');
        });
}

