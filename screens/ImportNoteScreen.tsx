import React, { useState, useContext, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import {
    Center,
    Button,
    Box,
    Input,
    InputField,
    InputSlot,
    InputIcon,
    VStack,
    FormControl,
    Text,
    useToast,
    Toast, ToastTitle, ToastDescription,
} from '@gluestack-ui/themed';
import theme from '../resources/theme.json';
import { useTranslation } from 'react-i18next';
import { MynoteContext } from '../context/mynoteContext';
import { MynoteContextType, ScreenType } from '../@types/mynote.d';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { encrypt } from '../utils/crypto';
import { fileIsValid, importFromFile } from '../utils/dbhelper';

import { sha256 } from 'react-native-sha256';
import { FolderDown } from 'lucide-react-native';

// Define the navigation type
type ImportNoteScreenProps = {
    navigation: {
        navigate: (screen: string) => void;
    };
};

const deviceWidth = Dimensions.get('window').width;
const contentWidth = deviceWidth - theme.content_margin;

export function ImportNoteScreen({ navigation }: ImportNoteScreenProps) {
    const { mynoteConfig, changeScreen } = useContext(MynoteContext) as MynoteContextType;
    const { t } = useTranslation();
    const [fileName, setFileName] = useState<any>('');
    const [fileFullName, setFileFullName] = useState<string>('');
    const [exportDisabled, setExportDisabled] = useState<boolean>(true);
    const toast = useToast();

    useEffect(() => {
        changeScreen(ScreenType.IMPORT_NOTE);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const importCallback = (rtnCode: string) => {
        if (rtnCode === '00') {
            toast.show({
                placement: 'top',
                duration: theme.toast_delay_duration,
                onCloseComplete: () => {
                    navigation.navigate('NoteMain');
                    changeScreen(ScreenType.NOTE_MAIN);
                },
                render: ({ id }) => {
                    const toastId = 'success-toast-' + id;
                    return (
                        <Toast nativeID={toastId} action="attention" variant="solid" bgColor={mynoteConfig.config.favColor} >
                            <VStack space="xs" w="80%" >
                                <ToastTitle>{t('message')}</ToastTitle>
                                <ToastDescription>
                                    {`${t('import_success')} ${fileName}`}
                                </ToastDescription>
                            </VStack>
                        </Toast>
                    );
                },
            });
        } else {
            toast.show({
                placement: 'top',
                duration: theme.toast_delay_duration,
                render: ({ id }) => {
                    const toastId = 'fail-toast-' + id;
                    return (
                        <Toast nativeID={toastId} action="attention" variant="solid" bgColor={theme.toast_fail_bg_color} >
                            <VStack space="xs" w="80%" >
                                <ToastTitle>{t('message')}</ToastTitle>
                                <ToastDescription>
                                    {t('import_failed')}
                                </ToastDescription>
                            </VStack>
                        </Toast>
                    );
                },
            });
        }
    };

    return (
        <Center>
            <Box width={contentWidth}>
                <Box alignItems="center" w="100%">
                    <FormControl mt={10} w="100%">
                        <VStack space="xs">
                            <VStack>
                                <FormControl.Label><Text>{t('import_file')}</Text></FormControl.Label>
                                <Input>
                                    <InputField type="text" value={fileName} onChangeText={(text: string) => {
                                        setFileName(text);
                                    }} />
                                    <InputSlot onPress={() => {
                                        DocumentPicker.pick({
                                            type: [DocumentPicker.types.allFiles],
                                        })
                                            .then((res: DocumentPickerResponse[]) => {
                                                let filePath: string;
                                                if (Platform.OS === 'ios') {
                                                    filePath = res[0].uri.replace('file://', '');
                                                } else {
                                                    filePath = res[0].uri;
                                                }
                                                try {
                                                    RNFS.readFile(filePath, 'utf8').then(file => {
                                                        if (fileIsValid(file)) {
                                                            setFileName(res[0].name);
                                                            setExportDisabled(false);
                                                            setFileFullName(filePath);
                                                        } else {
                                                            setFileName('');
                                                            setExportDisabled(true);
                                                            setFileFullName('');
                                                            toast.show({
                                                                placement: 'top',
                                                                duration: theme.toast_delay_duration,
                                                                render: ({ id }) => {
                                                                    const toastId = 'fail-toast-' + id;
                                                                    return (
                                                                        <Toast nativeID={toastId} action="attention" variant="solid" bgColor={theme.toast_fail_bg_color} >
                                                                            <VStack space="xs" w="80%" >
                                                                                <ToastTitle>{t('message')}</ToastTitle>
                                                                                <ToastDescription>
                                                                                    {t('file_invalid')}
                                                                                </ToastDescription>
                                                                            </VStack>
                                                                        </Toast>
                                                                    );
                                                                },
                                                            });
                                                        }
                                                    });
                                                } catch (e) {
                                                    console.log(e);
                                                }
                                            })
                                            .catch(err => {
                                                if (DocumentPicker.isCancel(err)) {
                                                    console.log('User Cancelled..');
                                                } else {
                                                    throw err;
                                                }
                                            });
                                    }}>
                                        <InputIcon marginRight={10} as={FolderDown} />
                                    </InputSlot>
                                </Input>
                            </VStack>
                            <VStack>
                                <Button
                                    mt="$8"
                                    bgColor={mynoteConfig.config.favColor}
                                    disabled={exportDisabled}
                                    onPress={() => {
                                        RNFS.readFile(fileFullName, 'utf8').then(file => {
                                            const notes = JSON.parse(file);
                                            const noteList = notes.noteList;

                                            sha256(mynoteConfig.config.encryptionkey).then(hash => {
                                                importFromFile(
                                                    mynoteConfig.config.notegroup,
                                                    noteList,
                                                    mynoteConfig.config.encryptionkey,
                                                    encrypt,
                                                    hash,
                                                    importCallback
                                                );
                                            });
                                        });
                                    }}>
                                    <Text color={theme.btn_txt_color}>{t('import')}</Text>
                                </Button>
                            </VStack>
                        </VStack>
                    </FormControl>
                </Box>
            </Box>
        </Center>
    );
}
