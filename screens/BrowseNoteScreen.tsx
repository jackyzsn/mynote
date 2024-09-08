import React, { useState, useContext, useEffect } from 'react';
import { Dimensions, Alert } from 'react-native';

import {
    Toast, ToastTitle, ToastDescription, Center, HStack,
    FlatList, Text, VStack, Icon, useToast, Box, Pressable, Checkbox, CheckboxIndicator, CheckboxIcon,
} from '@gluestack-ui/themed';
import theme from '../resources/theme.json';
import { useTranslation } from 'react-i18next';
import { MynoteContext } from '../context/mynoteContext';
import { MynoteContextType, ScreenType, NoteItemType } from '../@types/mynote.d';
import { deleteNotes, retrieveAllNotes, exportToFile } from '../utils/dbhelper';
import { decrypt } from '../utils/crypto';
import { sha256 } from 'react-native-sha256';
import { Trash2, CircleX, FileUp, MoveRight, CheckIcon } from 'lucide-react-native';

const deviceWidth = Dimensions.get('window').width;
const contentWidth = deviceWidth - theme.content_margin;

export function BrowseNoteScreen({ navigation }: { navigation: any }) {
    const { mynoteConfig, changeScreen } = useContext(MynoteContext) as MynoteContextType;
    const { t } = useTranslation();
    const [notelist, setNotelist] = useState<Array<NoteItemType>>([]);
    const [checkboxes, setCheckboxes] = useState<number[]>([]);
    const toast = useToast();

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            sha256(mynoteConfig.config.encryptionkey).then(hash => {
                retrieveAllNotes(mynoteConfig.config.notegroup, hash, setNotelist);
            });
        });
        return unsubscribe;
    }, [navigation, mynoteConfig.config.encryptionkey, mynoteConfig.config.notegroup]);

    useEffect(() => {
        changeScreen(ScreenType.BROWSE_NOTE);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const confirmDelete = (list: number[]) => {
        Alert.alert(
            t('confirm'),
            t('q_delete_note'),
            [
                {
                    text: t('cancel'),
                    style: 'cancel',
                },
                { text: t('ok'), onPress: () => deleteList(list) },
            ],
            { cancelable: false }
        );
    };

    const confirmExport = (list: number[]) => {
        Alert.alert(
            t('confirm'),
            t('q_export_note'),
            [
                {
                    text: t('cancel'),
                    style: 'cancel',
                },
                {
                    text: t('ok'),
                    onPress: () => {
                        exportToFile(list, mynoteConfig.config.encryptionkey, decrypt, exportCallback);
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const exportCallback = (rtnCode: string, fileName: string) => {
        if (rtnCode === '00') {
            toast.show({
                placement: 'top',
                duration: theme.toast_delay_duration,
                render: ({ id }) => {
                    const toastId = 'success-toast-' + id;
                    return (
                        <Toast nativeID={toastId} action="attention" variant="solid" bgColor={mynoteConfig.config.favColor} >
                            <VStack space="xs" w="80%" >
                                <ToastTitle>{t('message')}</ToastTitle>
                                <ToastDescription>
                                    {`${t('export_success')} ${fileName}`}
                                </ToastDescription>
                            </VStack>
                        </Toast>
                    );
                },
            });
            setCheckboxes([]);
            navigation.navigate('NoteMain');
            changeScreen(ScreenType.NOTE_MAIN);
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
                                    {rtnCode === '10' ? t('nothing_export') : t('export_failed')}
                                </ToastDescription>
                            </VStack>
                        </Toast>
                    );
                },
            });
        }
    };

    const deleteCallback = (rtnCode: string, list: number[]) => {
        if (rtnCode === '00') {
            const updatedNotelist = notelist.filter(item => !list.includes(item.id));
            setCheckboxes([]);
            setNotelist(updatedNotelist);

            toast.show({
                placement: 'top',
                duration: theme.toast_delay_duration,
                render: ({ id }) => {
                    const toastId = 'success-toast-' + id;
                    return (
                        <Toast nativeID={toastId} action="attention" variant="solid" bgColor={mynoteConfig.config.favColor} >
                            <VStack space="xs" w="80%" >
                                <ToastTitle>{t('message')}</ToastTitle>
                                <ToastDescription>
                                    {t('note_delete_success')}
                                </ToastDescription>
                            </VStack>
                        </Toast>
                    );
                },
            });
            navigation.navigate('NoteMain');
            changeScreen(ScreenType.NOTE_MAIN);
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
                                    {t('note_delete_failed')}
                                </ToastDescription>
                            </VStack>
                        </Toast>
                    );
                },
            });
        }
    };

    const deleteList = (list: number[]) => {
        deleteNotes(list, deleteCallback);
    };

    const toggleCheckbox = (id: number) => {
        const updatedCheckboxes = checkboxes.includes(id)
            ? checkboxes.filter(checkboxId => checkboxId !== id)
            : [...checkboxes, id];
        setCheckboxes(updatedCheckboxes);
    };

    return (
        <Box flex={1} bg="white" width="100%" alignSelf="center">
            <Center justifyContent="flex-start" flex={1}>
                <Box width={contentWidth}>
                    <Box w="100%">
                        <FlatList
                            data={notelist}
                            renderItem={(rec: any) => (
                                <Box borderBottomWidth="$1" borderColor={theme.minor_text_color} pl="$4" pr="$5" py="$2">
                                    <HStack space="md" justifyContent="space-evenly" alignItems="center" w="100%">
                                        <Checkbox size="lg" value=""
                                            isInvalid={false}
                                            isDisabled={false}
                                            isChecked={checkboxes.includes(rec.item.id)}
                                            onChange={() => {
                                                toggleCheckbox(rec.item.id);
                                            }}
                                        >
                                            <CheckboxIndicator mr="$2" $checked-borderColor={mynoteConfig.config.favColor}>
                                                <CheckboxIcon as={CheckIcon} color="white" backgroundColor={mynoteConfig.config.favColor} />
                                            </CheckboxIndicator>
                                        </Checkbox>

                                        <Pressable
                                            onPress={() =>
                                                navigation.navigate('NoteDetail', {
                                                    itemid: rec.item.id,
                                                    notetag: rec.item.note_tag,
                                                    backto: 'BrowseNote',
                                                })
                                            }
                                        >
                                            <VStack>
                                                <Text color={theme.major_text_color}>{rec.item.note_tag}</Text>
                                                <Text color={theme.major_text_color}>{rec.item.updt}</Text>
                                            </VStack>
                                        </Pressable>
                                        <Pressable
                                            onPress={() =>
                                                navigation.navigate('NoteDetail', {
                                                    itemid: rec.item.id,
                                                    notetag: rec.item.note_tag,
                                                    backto: 'BrowseNote',
                                                })
                                            }
                                        >
                                            <Icon as={MoveRight} />
                                        </Pressable>
                                    </HStack>
                                </Box>
                            )}
                            keyExtractor={(item: any) => item.id.toString()}
                        />
                    </Box>
                </Box>
            </Center >
            <HStack bg={mynoteConfig.config.favColor} alignItems="center">
                <Pressable
                    cursor="pointer"
                    opacity={checkboxes.length === 0 ? 0.5 : 1}
                    py="$3"
                    flex={1}
                    disabled={checkboxes.length === 0}
                    onPress={() => confirmDelete(checkboxes)}
                >
                    <Center>
                        <Icon mb="$1" as={Trash2} color="white" size="sm" />
                        <Text color="white" >
                            {t('delete')}
                        </Text>
                    </Center>
                </Pressable>
                <Pressable
                    cursor="pointer"
                    opacity={checkboxes.length === 0 || !mynoteConfig.config.hasPermission ? 0.5 : 1}
                    py="$2"
                    flex={1}
                    disabled={checkboxes.length === 0 || !mynoteConfig.config.hasPermission}
                    onPress={() => confirmExport(checkboxes)}
                >
                    <Center>
                        <Icon mb="$1" as={FileUp} color="white" size="sm" />
                        <Text color="white" >
                            {t('export')}
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
                    }}
                >
                    <Center>
                        <Icon mb="$1" as={CircleX} color="white" size="sm" />
                        <Text color="white" >
                            {t('cancel')}
                        </Text>
                    </Center>
                </Pressable>
            </HStack>
        </Box >
    );
}
