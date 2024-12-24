import React, { useState, useContext, useEffect } from 'react';
import { Dimensions, Alert, Keyboard, Platform } from 'react-native';
import {
    Textarea, TextareaInput,
    Text,
    Icon,
    Input, InputField,
    Toast, ToastTitle, ToastDescription,
    Box,
    Center,
    HStack, VStack,
    Pressable,
    useToast,
    Heading,
    Divider,
    ScrollView,
    Button, ButtonIcon,
} from '@gluestack-ui/themed';
import HighlightedText, { Highlight } from 'react-native-highlighter';
import theme from '../resources/theme.json';
import { useTranslation } from 'react-i18next';
import { MynoteContext } from '../context/mynoteContext';
import { MynoteContextType, ScreenType } from '../@types/mynote.d';
import { encrypt, decrypt } from '../utils/crypto';
import { retrieveNoteDetail, updateNote } from '../utils/dbhelper';
import { ArrowLeft, CircleX, Pencil, PencilOff, Search, SquarePen } from 'lucide-react-native';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
const contentWidth = deviceWidth - theme.content_margin;

type RouteParams = {
    itemid: string;
    notetag: string;
    backto: string;
};

type NoteDetailScreenProps = {
    route: { params: RouteParams };
    navigation: any;
};

type TextSelectionProps = {
    start: number;
    end?: number;
}

export function NoteDetailScreen({ route, navigation }: NoteDetailScreenProps): JSX.Element {
    const { mynoteConfig, changeScreen } = useContext(MynoteContext) as MynoteContextType;
    const { t } = useTranslation();
    const [notecontent, setNotecontent] = useState<string>('');
    const [updatable, setUpdatable] = useState<boolean>(true);
    const [detailUpdated, setDetailUpdated] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>('');
    const [searchStartFrom, setSearchStartFrom] = useState<number>(0);
    const { itemid, notetag, backto } = route.params;
    const [edit, setEdit] = useState<boolean>(false);
    const [toLocate, setToLocate] = useState<boolean>(false);
    const [searchHit, setSearchHit] = useState<boolean>(false);
    const [scrollViewRef, setScrollViewRef] = useState<any | null>(null);
    const [originalContent, setOriginalContent] = useState<string>('');
    const [lines, setLines] = useState<Array<{ text: string; y: number; height: number; width: number }>>([]);
    const [textSelection, setTextSelection] = useState<TextSelectionProps | undefined>(undefined);

    const toast = useToast();

    const textareaInputRef = React.useRef<any>(null);
    // const textareaInputRef = React.useRef<TextInput>(null);  <== Will have error in vscode, however runs fine

    const stringToScreenType = (inString: string): ScreenType => {
        if (inString === 'NoteMain') {
            return ScreenType.NOTE_MAIN;
        } else if (inString === 'NewNote') {
            return ScreenType.NEW_NOTE;
        } else if (inString === 'NoteDetail') {
            return ScreenType.NOTE_DETAIL;
        } else if (inString === 'BrowseNote') {
            return ScreenType.BROWSE_NOTE;
        } else if (inString === 'SearchExistingNotes') {
            return ScreenType.SEARCH_NOTE;
        } else if (inString === 'ImportNote') {
            return ScreenType.IMPORT_NOTE;
        } else {
            return ScreenType.HOME;
        }
    };

    const updateCallback = (rtnCode: string) => {
        if (rtnCode === '00') {
            toast.show({
                placement: 'top',
                duration: theme.toast_delay_duration,
                onCloseComplete: () => {
                    navigation.navigate('BrowseNote');
                    changeScreen(ScreenType.BROWSE_NOTE);
                },
                render: ({ id }) => {
                    const toastId = 'success-toast-' + id;
                    return (
                        <Toast nativeID={toastId} action="attention" variant="solid" bgColor={mynoteConfig.config.favColor} >
                            <VStack space="xs" w="80%" >
                                <ToastTitle>{t('message')}</ToastTitle>
                                <ToastDescription>
                                    {t('note_update_success')}
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
                                    {t('note_update_failed')}
                                </ToastDescription>
                            </VStack>
                        </Toast>
                    );
                },
            });
        }
    };

    const updateCallbackNotBack = (rtnCode: string) => {
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
                                    {t('note_update_success')}
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
                                    {t('note_update_failed')}
                                </ToastDescription>
                            </VStack>
                        </Toast>
                    );
                },
            });
        }
    };

    const decryptText = (rtnCode: string, encryptedText: string) => {
        if (rtnCode === '00') {
            const decryptedText = decrypt(encryptedText, mynoteConfig.config.encryptionkey);
            if (decryptedText) {
                setNotecontent(decryptedText);
                setOriginalContent(decryptedText);
                setUpdatable(true);
            } else {
                setNotecontent(encryptedText);
                setUpdatable(false);
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
                                        {t('note_not_decrypted')}
                                    </ToastDescription>
                                </VStack>
                            </Toast>
                        );
                    },
                });
            }
        } else {
            toast.show({
                placement: 'top',
                duration: theme.toast_delay_duration,
                onCloseComplete: () => {
                    navigation.navigate('BrowseNote');
                    changeScreen(ScreenType.BROWSE_NOTE);
                },
                render: ({ id }) => {
                    const toastId = 'fail-toast-' + id;
                    return (
                        <Toast nativeID={toastId} action="attention" variant="solid" bgColor={theme.toast_fail_bg_color} >
                            <VStack space="xs" w="80%" >
                                <ToastTitle>{t('message')}</ToastTitle>
                                <ToastDescription>
                                    {t('note_not_found')}
                                </ToastDescription>
                            </VStack>
                        </Toast>
                    );
                },
            });
        }
    };

    useEffect(() => {
        retrieveNoteDetail(Number(itemid), decryptText);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemid]);

    useEffect(() => {
        changeScreen(ScreenType.NOTE_DETAIL);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (toLocate) {
            locateTextArea();
            setToLocate(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toLocate]);

    const confirmCancel = () => {
        if (originalContent !== notecontent) {
            Alert.alert(
                t('confirm_exit_title'),
                t('confirm_exit_body'),
                [
                    {
                        text: t('save'),
                        onPress: () => {
                            const tmpTxt = encrypt(notecontent, mynoteConfig.config.encryptionkey);
                            updateNote(Number(itemid), tmpTxt, updateCallback);
                            navigation.navigate(backto);
                            changeScreen(stringToScreenType(backto));
                        },
                    },
                    {
                        text: t('not_save'),
                        onPress: () => {
                            navigation.navigate(backto);
                            changeScreen(stringToScreenType(backto));
                        },
                    },
                ],
                { cancelable: false }
            );
        } else {
            navigation.navigate(backto);
            changeScreen(stringToScreenType(backto));
        }
    };

    const locateTextArea = () => {
        setTextSelection({
            start: searchStartFrom,
            end: searchStartFrom,
        });

        textareaInputRef?.current?.focus();
    };

    const searchTextArea = () => {
        const inx = notecontent.toLowerCase().indexOf(searchText.trim().toLowerCase(), searchStartFrom);

        if (inx > -1) {
            setSearchStartFrom(inx + searchText.length);

            setTextSelection({
                start: inx,
                end: inx + searchText.length,
            });
            textareaInputRef?.current?.focus();

        } else {
            setSearchStartFrom(0);
            setTextSelection(undefined);
            toast.show({
                placement: 'top',
                duration: theme.toast_delay_duration,
                render: ({ id }) => {
                    const toastId = 'end-toast-' + id;
                    return (
                        <Toast nativeID={toastId} action="attention" variant="solid" bgColor={theme.toast_fail_bg_color} >
                            <VStack space="xs" w="80%" >
                                <ToastTitle>{t('message')}</ToastTitle>
                                <ToastDescription>
                                    {t('end_of_search')}
                                </ToastDescription>
                            </VStack>
                        </Toast>
                    );
                },
            });
        }
    };

    const searchTextView = () => {
        Keyboard.dismiss();
        const inx = notecontent.toLowerCase().indexOf(searchText.trim().toLowerCase(), searchStartFrom);
        if (inx > -1) {
            setSearchHit(true);

            let firstOccurrencePosition = 0.0;

            for (const line of lines) {
                if (line.text.toLowerCase().includes(searchText.trim().toLowerCase())) {
                    firstOccurrencePosition = line.y;
                    break;
                }
            }

            const scrollToPosition =
                Platform.OS === 'ios'
                    ? firstOccurrencePosition - deviceHeight / 2
                    : firstOccurrencePosition - deviceHeight;

            if (scrollViewRef) {
                scrollViewRef.scrollTo({
                    x: 0,
                    y: scrollToPosition > 0 ? scrollToPosition : 0.0,
                    animated: true,
                });
            }
        } else {
            setSearchHit(false);
            toast.show({
                placement: 'top',
                duration: theme.toast_delay_duration,
                render: ({ id }) => {
                    const toastId = 'end-toast-' + id;
                    return (
                        <Toast nativeID={toastId} action="attention" variant="solid" bgColor={theme.toast_fail_bg_color} >
                            <VStack space="xs" w="80%" >
                                <ToastTitle>{t('message')}</ToastTitle>
                                <ToastDescription>
                                    {t('end_of_search')}
                                </ToastDescription>
                            </VStack>
                        </Toast>
                    );
                },
            });
        }
    };

    const switchToEdit = (event: any) => {
        const clickX = event.nativeEvent.locationX;
        const clickY = event.nativeEvent.locationY;

        let clickedRow = lines.findIndex(line => line.y < clickY && clickY <= line.y + line.height);
        if (clickedRow === -1) {
            clickedRow = lines.length - 1;
        }

        const row = lines[clickedRow].text;
        const calculatedOffset = Math.ceil((row.length * clickX) / lines[clickedRow].width) - 1;
        const rowX = calculatedOffset > row.length ? row.length : calculatedOffset;

        let offset = 0;
        for (let i = 0; i < clickedRow; i++) {
            offset += lines[i].text.length;
        }

        offset += rowX;

        setSearchText('');
        setSearchStartFrom(offset);
        setEdit(true);
        setToLocate(true);
    };

    const notetagFix = notetag.length > 20 ? notetag.substring(0, 12) + "..."  + notetag.substring(notetag.length - 5, notetag.length ) : notetag;

    return (
        <Box flex={1} bg="white" width="100%" alignSelf="center">
            <HStack w="98%" bg="transparent" p="$3" alignItems="center" justifyContent="space-between" >
                <Pressable
                    cursor="pointer"
                    mt={2}
                    ml={2}
                    onPress={() => {
                        if (detailUpdated) {
                            confirmCancel();
                        } else {
                            navigation.navigate(backto);
                            changeScreen(stringToScreenType(backto));
                        }
                    }}>
                    <Icon mb="$1" ml="$2" as={ArrowLeft} color={theme.major_text_color} size="lg" />
                </Pressable>
                <Heading size="md" color={theme.major_text_color}>
                    {notetagFix}
                </Heading>
                <HStack bg="transparent" justifyContent="center" alignItems="center" w="35%">
                    <Button w="10%"
                        borderRadius="$full"
                        size="xs"
                        bg="transparent"
                        onPress={() => {
                            if (edit && detailUpdated) {
                                if (originalContent !== notecontent) {
                                    Alert.alert(
                                        t('confirm_exit_title'),
                                        t('confirm_exit_body'),
                                        [
                                            {
                                                text: t('save'),
                                                onPress: () => {
                                                    let tmpTxt = encrypt(notecontent, mynoteConfig.config.encryptionkey);
                                                    updateNote(Number(itemid), tmpTxt, updateCallbackNotBack);
                                                    setOriginalContent(notecontent);
                                                    setEdit(!edit);
                                                },
                                            },
                                            {
                                                text: t('not_save'),
                                                onPress: () => {
                                                    setNotecontent(originalContent);
                                                    setEdit(!edit);
                                                },
                                            },
                                        ],
                                        { cancelable: false }
                                    );
                                } else {
                                    setEdit(!edit);
                                }
                            } else {
                                setEdit(!edit);
                            }
                        }}
                    >
                        <ButtonIcon as={edit ? PencilOff : Pencil} $pressed-bgColor={theme.bg_highlight_color} color={mynoteConfig.config.favColor} size="xs" />
                    </Button>
                    <Input borderWidth={0} w="75%">
                        <InputField type="text"
                            value={searchText}
                            placeholder={t('search_text')}
                            selectionColor={mynoteConfig.config.favColor}
                            onChangeText={(text: string) => {
                                setSearchText(text);
                                setSearchStartFrom(0);
                            }} />
                    </Input>
                    <Button w="15%"
                        borderRadius="$full"
                        size="xs"
                        bg="transparent"
                        opacity={!searchText || searchText.trim().length === 0 ? 0.5 : 1}
                        disabled={!searchText || searchText.trim().length === 0}
                        onPress={() => {
                            if (edit) {
                                searchTextArea();
                            } else {
                                searchTextView();
                            }
                        }}
                    >
                        <ButtonIcon as={Search} size="xs" color={mynoteConfig.config.favColor} />
                    </Button>
                </HStack>
            </HStack>
            <Divider my="$2" bg="lightgrey" />
            {!edit && (
                <ScrollView
                    ref={ref => {
                        setScrollViewRef(ref);
                    }}>
                    <Box w="100%" width={contentWidth} ml={theme.content_margin / 8} mr={theme.content_margin / 8} alignSelf="center">
                        {!searchHit ? (
                            <Text
                                textAlign="left"
                                onTextLayout={event => {
                                    setLines(event.nativeEvent.lines);
                                }}
                                onPress={switchToEdit}>
                                {notecontent}
                            </Text>
                        ) : (
                            <HighlightedText style={{ color: theme.major_text_color }} onPress={switchToEdit} highlights={[new Highlight({
                                keywords: [searchText],
                                style: { color: theme.major_text_color, backgroundColor: mynoteConfig.config.favColor, fontWeight: 'bold' },
                            })]}>
                                {notecontent}
                            </HighlightedText>
                        )}
                    </Box>
                </ScrollView>
            )}
            <Center justifyContent="flex-start" flex={1}>
                <Box width={contentWidth} ml={theme.content_margin / 8} mr={theme.content_margin / 8}>
                    {edit && (
                        <Textarea w="100%" h="100%" borderWidth={0} >
                            <TextareaInput placeholder={t('note_area')} value={notecontent}
                                onChangeText={(text: string) => {
                                    setNotecontent(text);
                                    setDetailUpdated(true);
                                    setTextSelection(undefined);
                                }}
                                onTouchEnd={() => { setTextSelection(undefined); }}
                                selection={textSelection}
                                ref={textareaInputRef}
                                selectionColor={mynoteConfig.config.favColor}
                                autoCorrect={false}
                                maxLength={10240000}
                            />
                        </Textarea>
                    )}
                </Box>
            </Center>
            <HStack bg={mynoteConfig.config.favColor} alignItems="center" >
                <Pressable
                    cursor="pointer"
                    opacity={!edit || !updatable || notecontent.trim() === '' ? 0.5 : 1}
                    py="$3"
                    flex={1}
                    disabled={!edit || !updatable || notecontent.trim() === ''}
                    onPress={() => {
                        let tmpTxt = encrypt(notecontent, mynoteConfig.config.encryptionkey);
                        updateNote(Number(itemid), tmpTxt, updateCallback);
                    }}>
                    <Center>
                        <Icon mb="$1" as={SquarePen} color="white" size="sm" />
                        <Text color="white" >
                            {t('save')}
                        </Text>
                    </Center>
                </Pressable>
                <Pressable
                    cursor="pointer"
                    py="$2"
                    flex={1}
                    onPress={() => {
                        if (detailUpdated) {
                            confirmCancel();
                        } else {
                            navigation.navigate(backto);
                            changeScreen(stringToScreenType(backto));
                        }
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
