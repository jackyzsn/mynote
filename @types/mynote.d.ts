export interface Config {
    notegroup: string;
    encryptionkey: string;
    hasPermission: boolean;
    favColor: string;
}

export enum ScreenType {
    HOME = 'Home',
    NOTE_MAIN = 'NoteMain',
    NEW_NOTE = 'NewNote',
    NOTE_DETAIL = 'NoteDetail',
    BROWSE_NOTE = 'BrowseNote',
    SEARCH_NOTE = 'SearchExistingNotes',
    IMPORT_NOTE = 'ImportNote',
    RESTORE_CLOUD = 'RestoreCloud',
}

export interface MynoteConfig {
    config: Config;
    currentScreen: string;
}

export type MynoteContextType = {
    mynoteConfig: MynoteConfig;
    changeScreen: (screenType: ScreenType) => void;
    changeConfig: (config: Config) => void;
}

export interface NoteItemType {
    id: number;
    note_tag: string;
    updt: string
}

export interface NoteItemTextType {
    id: number;
    noteTag: string;
    updateTime: string;
    noteText: string
}

export interface BackupType {
    uuid: string;
    device: string;
    backupAt: string
}

export type NoteType = {
    noteTag: string;
    noteText: string;
};

