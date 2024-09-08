import React, { useState, useContext, useEffect } from 'react';
import { Dimensions, Alert } from 'react-native';

import {
    Checkbox, CheckboxIndicator, CheckboxIcon,
    Toast, ToastTitle, ToastDescription,
    Center,
    HStack,
    FlatList,
    Text,
    VStack,
    Icon,
    useToast,
    Box,
    Pressable,
    Heading,
    Input, InputField, ButtonIcon,
    Button,
    Divider,
} from '@gluestack-ui/themed';
import theme from '../resources/theme.json';
import { useTranslation } from 'react-i18next';
import { MynoteContext } from '../context/mynoteContext';
import { MynoteContextType, ScreenType } from '../@types/mynote.d';
import { decrypt } from '../utils/crypto';
import { deleteNotes, searchTextAllNotes, exportToFile } from '../utils/dbhelper';
import { ArrowLeft, CircleX, Trash2, MoveRight, Search, CheckIcon, FileUp } from 'lucide-react-native';

const deviceWidth = Dimensions.get('window').width;
const contentWidth = deviceWidth - theme.content_margin;

interface Note {
    id: number;
    note_tag: string;
    updt: string;
}

interface SearchExistingNotesScreenProps {
    navigation: any; // Replace 'any' with a more specific type if known
}

export function SearchExistingNotesScreen({ navigation }: SearchExistingNotesScreenProps) {
    const { mynoteConfig, changeScreen } = useContext(MynoteContext) as MynoteContextType;
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState<string>('');
    const [notelist, setNotelist] = useState<Note[]>([]);
    const [checkboxes, setCheckboxes] = useState<number[]>([]);

    const toast = useToast();

    useEffect(() => {
        changeScreen(ScreenType.SEARCH_NOTE);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const deleteCallback = (rtnCode: string, list: number[]) => {
        if (rtnCode === '00') {
            let wkNotelist = [...notelist];
            list.forEach(item => {
                wkNotelist = wkNotelist.filter(note => note.id !== item);
            });

            setCheckboxes([]);
            setNotelist(wkNotelist);

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
        const wkChkboxes = [...checkboxes];
        const index = wkChkboxes.indexOf(id);

        if (index > -1) {
            wkChkboxes.splice(index, 1);
        } else {
            wkChkboxes.push(id);
        }

        setCheckboxes(wkChkboxes);
    };

    return (
        <Box flex={1} bg="white" width="100%" alignSelf="center">
            <HStack w="98%" bg="transparent" p="$3" alignItems="center" justifyContent="space-between" >
                <Pressable
                    cursor="pointer"
                    mt={2}
                    ml={2}
                    onPress={() => {
                        navigation.navigate('NoteMain');
                        changeScreen(ScreenType.NOTE_MAIN);
                    }}>
                    <Icon mb="$1" ml="$2" as={ArrowLeft} color={theme.major_text_color} size="lg" />
                </Pressable>
                <Heading size="md" color={theme.major_text_color}>
                    {t('search_in_notes')}
                </Heading>
                <HStack bg="transparent" justifyContent="center" alignItems="center" w="35%">
                    <Input borderWidth={0} w="70%">
                        <InputField type="text"
                            value={searchText}
                            placeholder={t('search_text')}
                            selectionColor={mynoteConfig.config.favColor}
                            onChangeText={(text: string) => {
                                setSearchText(text);
                            }} />
                    </Input>
                    <Button w="20%"
                        borderRadius="$full"
                        size="xs"
                        bg="transparent"
                        opacity={!searchText || searchText.trim().length === 0 ? 0.5 : 1}
                        disabled={!searchText || searchText.trim().length === 0}
                        onPress={() => {
                            searchTextAllNotes(
                                mynoteConfig.config.notegroup,
                                searchText,
                                mynoteConfig.config.encryptionkey,
                                decrypt,
                                setNotelist
                            );
                        }}
                    >
                        <ButtonIcon as={Search} size="xs" color={mynoteConfig.config.favColor} />
                    </Button>
                </HStack>
            </HStack>
            <Divider my="$2" bg="lightgrey" />
            <Center justifyContent="flex-start" flex={1}>
                <Box width={contentWidth}>
                    <Box w="100%">
                        <FlatList
                            data={notelist}
                            keyExtractor={(item: any) => item.id}
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
                                            onPress={() => {
                                                navigation.navigate('NoteDetail', {
                                                    itemid: rec.item.id,
                                                    notetag: rec.item.note_tag,
                                                    backto: 'SearchExistingNotes',
                                                });
                                            }}>
                                            <VStack>
                                                <Text color={theme.major_text_color}>{rec.item.note_tag}</Text>
                                                <Text color={theme.major_text_color}>{rec.item.updt}</Text>
                                            </VStack>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => {
                                                navigation.navigate('NoteDetail', {
                                                    itemid: rec.item.id,
                                                    notetag: rec.item.note_tag,
                                                    backto: 'SearchExistingNotes',
                                                });
                                            }}>
                                            <Icon as={MoveRight} />
                                        </Pressable>
                                    </HStack>
                                </Box>
                            )}
                        />
                    </Box>
                </Box>
            </Center>
            <HStack bg={mynoteConfig.config.favColor} alignItems="center" >
                <Pressable
                    cursor="pointer"
                    opacity={checkboxes.length === 0 ? 0.5 : 1}
                    py="$3"
                    flex={1}
                    disabled={checkboxes.length === 0}
                    onPress={() => confirmDelete(checkboxes)}>
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
                    onPress={() => confirmExport(checkboxes)}>
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
