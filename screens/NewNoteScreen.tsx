import React, { useState, useContext, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import {
    Text,
    Input, InputField, InputSlot, InputIcon,
    useToast,
    Icon,
    Box,
    Center,
    HStack,
    Pressable,
    FormControl,
    Textarea, TextareaInput,
    VStack,
    Toast, ToastTitle, ToastDescription,
} from '@gluestack-ui/themed';
import theme from '../resources/theme.json';
import { useTranslation } from 'react-i18next';
import { MynoteContext } from '../context/mynoteContext';
import { MynoteContextType, ScreenType } from '../@types/mynote.d';
import { encrypt } from '../utils/crypto';
import { insertNote } from '../utils/dbhelper';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { Save, CircleX, FileText } from 'lucide-react-native';
import { sha256 } from 'react-native-sha256';

const deviceWidth = Dimensions.get('window').width;
const contentWidth = deviceWidth - theme.content_margin;

interface NewNoteScreenProps {
    navigation: any;
}

export function NewNoteScreen({ navigation }: NewNoteScreenProps): JSX.Element {
    const { mynoteConfig, changeScreen } = useContext(MynoteContext) as MynoteContextType;
    const { t } = useTranslation();
    const [notecontent, setNotecontent] = useState<string>('');
    const [notetag, setNotetag] = useState<string>('');
    const toast = useToast();

    useEffect(() => {
        changeScreen(ScreenType.NEW_NOTE);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showToast = (rtnCode: string) => {
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
                                    {t('note_save_success')}
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
                    const toastId = 'fail-10-toast-' + id;
                    return (
                        <Toast nativeID={toastId} action="attention" variant="solid" bgColor={theme.toast_fail_bg_color} >
                            <VStack space="xs" w="80%" >
                                <ToastTitle>{t('message')}</ToastTitle>
                                <ToastDescription>
                                    {rtnCode === '10' ? t('note_tag_exist') : t('note_save_failed')}
                                </ToastDescription>
                            </VStack>
                        </Toast>
                    );
                },
            });
        }
    };

    return (
        <Box flex={1} bg="white" width="100%" alignSelf="center">
            <Center justifyContent="flex-start" flex={1}>
                <Box width={contentWidth}>
                    <Box w="100%">
                        <FormControl mt={2}>
                            <VStack space="xs">
                                <VStack>
                                    <Input>
                                        <InputField value={notetag} placeholder={t('note_tag')} onChangeText={(text: string) => {
                                            setNotetag(text);
                                        }} />
                                        <InputSlot onPress={() =>
                                            DocumentPicker.pick({
                                                type: [DocumentPicker.types.allFiles],
                                            })
                                                .then(res => {
                                                    let filePath: string;

                                                    if (Platform.OS === 'ios') {
                                                        filePath = res[0].uri.replace('file://', '');
                                                    } else {
                                                        filePath = res[0].uri;
                                                    }

                                                    RNFS.readFile(filePath, 'utf8')
                                                        .then(file => {
                                                            setNotecontent(file);
                                                        })
                                                        .catch(err => {
                                                            throw err;
                                                        });
                                                })
                                                .catch(err => {
                                                    if (DocumentPicker.isCancel(err)) {
                                                        console.log('User Cancelled..');
                                                    } else {
                                                        throw err;
                                                    }
                                                })
                                        }>
                                            <InputIcon marginRight={10} as={FileText} />
                                        </InputSlot>
                                    </Input>
                                </VStack>
                                <VStack>
                                    <Textarea w="100%" h="93%" borderWidth={0}>
                                        <TextareaInput placeholder={t('note_area')} value={notecontent}
                                            onChangeText={(text: string) => {
                                                setNotecontent(text);
                                            }}
                                            maxLength={10240000}
                                        />
                                    </Textarea>
                                </VStack>
                            </VStack>
                        </FormControl>
                    </Box>
                </Box>
            </Center>
            <HStack bg={mynoteConfig.config.favColor} alignItems="center" >
                <Pressable
                    cursor="pointer"
                    opacity={notetag.trim() === '' ? 0.5 : 1}
                    py="$3"
                    flex={1}
                    disabled={notetag.trim() === ''}
                    onPress={() => {
                        const encryptedText = encrypt(notecontent, mynoteConfig.config.encryptionkey);

                        sha256(mynoteConfig.config.encryptionkey).then(hash => {
                            insertNote(mynoteConfig.config.notegroup, notetag, encryptedText, hash, showToast);
                        });
                    }}>
                    <Center>
                        <Icon mb="$1" as={Save} color="white" size="sm" />
                        <Text color="white" size="lg">
                            {t('save')}
                        </Text>
                    </Center>
                </Pressable>
                <Pressable
                    cursor="pointer"
                    py="$2"
                    flex={1}
                    onPress={() => {
                        navigation.navigate('NoteMain');
                        changeScreen(ScreenType.NOTE_MAIN);
                    }}>
                    <Center>
                        <Icon mb="$1" as={CircleX} color="white" size="sm" />
                        <Text color="white" >
                            {t('cancel')}
                        </Text>
                    </Center>
                </Pressable>
            </HStack>
        </Box>
    );
}
