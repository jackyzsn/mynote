import React, { useState, useContext, useEffect } from 'react';
import { Dimensions, View, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {
    Button,
    ButtonIcon,
    Input,
    InputField,
    InputSlot,
    InputIcon,
    FormControl,
    Text,
    Spinner,
    VStack,
    Center,
    Box,
    HStack,
} from '@gluestack-ui/themed';
import theme from '../resources/theme.json';
import { useTranslation } from 'react-i18next';
import { MynoteContext } from '../context/mynoteContext';
import { MynoteContextType } from '../@types/mynote.d';
import { createTable } from '../utils/dbhelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestMultiple, checkMultiple, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { SettingsIcon, EyeIcon, EyeOffIcon, Palette } from 'lucide-react-native';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
const contentWidth = deviceWidth - theme.content_margin;

interface ImportHomeScreenProps {
    navigation: any;
}

export function HomeScreen({ navigation }: ImportHomeScreenProps): JSX.Element {
    const { mynoteConfig, changeConfig } = useContext(MynoteContext) as MynoteContextType;
    const { t } = useTranslation();
    const [notegroup, setNotegroup] = useState(mynoteConfig.config.notegroup);
    const [encrypkey, setEncrypkey] = useState(mynoteConfig.config.encryptionkey);
    const [hasPermission, setHasPermission] = useState(mynoteConfig.config.hasPermission);
    const [secureKey, setSecureKey] = useState(true);

    const [themeColor, setThemeColor] = useState('#6FCF97');
    const [loading, setLoading] = useState(true);

    const [isOpen, setIsOpen] = React.useState(false);

    const checkPermission = () => {
        if (Platform.OS === 'android') {
            const deviceVersion = DeviceInfo.getSystemVersion();

            if (Number(deviceVersion) >= 13) {
                setHasPermission(true);
                return;
            }

            checkMultiple([PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE, PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE]).then(
                statuses => {
                    if (
                        statuses[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE] !== RESULTS.GRANTED ||
                        statuses[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] !== RESULTS.GRANTED
                    ) {
                        requestMultiple([
                            PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
                            PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
                        ]).then(sts => {
                            if (
                                sts[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] === RESULTS.GRANTED &&
                                sts[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE] === RESULTS.GRANTED
                            ) {
                                setHasPermission(true);
                            } else {
                                setHasPermission(false);
                            }
                        });
                    } else {

                        setHasPermission(true);
                    }
                }
            );
        } else {
            setHasPermission(true);
        }
    };

    // Only want to execute once
    useEffect(() => {
        createTable();
        checkPermission();

        AsyncStorage.getItem('MyNote').then(favColor => {
            if (favColor) {
                setThemeColor(favColor);
            }
            setLoading(false);
        });
    }, []);

    return (
        <React.Fragment>
            <Center>
                <Box width={contentWidth}>
                    <Box alignItems="center" w="100%">
                        {loading ? (
                            <View style={{ marginTop: deviceHeight / 2.5 }}>
                                <Spinner color="blue" />
                            </View>
                        ) : (
                            <Box alignItems="flex-start" w="100%">
                                <FormControl mt={10} w="100%">
                                    <VStack space="xs">
                                        <VStack>
                                            <FormControl.Label><Text>{t('note_group')}</Text></FormControl.Label>
                                            <Input>
                                                <InputField value={notegroup} onChangeText={(text: string) => {
                                                    setNotegroup(text);
                                                }} />
                                            </Input>
                                        </VStack>

                                        <VStack>
                                            <FormControl.Label><Text>{t('encryption_key')}</Text></FormControl.Label>

                                            <Input>
                                                <InputField type={secureKey ? 'password' : 'text'} onChangeText={text => {
                                                    setEncrypkey(text);
                                                }} />
                                                <InputSlot onPress={() => setSecureKey(!secureKey)}>
                                                    <InputIcon marginRight={10} as={secureKey ? EyeIcon : EyeOffIcon} />
                                                </InputSlot>
                                            </Input>
                                        </VStack>
                                        <VStack>
                                            <Button
                                                mt="$32"
                                                bgColor={themeColor}
                                                onPress={() => {
                                                    changeConfig({
                                                        notegroup,
                                                        encryptionkey: encrypkey,
                                                        hasPermission,
                                                        favColor: themeColor,
                                                    });

                                                    AsyncStorage.setItem('MyNote', themeColor);
                                                    navigation.navigate('NoteMain');
                                                }}>
                                                <Text color={theme.btn_txt_color}>{t('next')}</Text>
                                            </Button>
                                        </VStack>
                                    </VStack>
                                </FormControl>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Center>
            <Box position={'absolute'} bottom={5} alignSelf="center">
                <HStack alignItems="flex-end" justifyContent="space-between" width={contentWidth}>
                    <Text left={2}>v{theme.ver}</Text>

                    <Box alignItems="center" marginRight={2}>
                        {isOpen ? <VStack alignItems="center" marginBottom={5}>
                            <Button
                                borderRadius="$full"
                                size="md"
                                p="$3.5"
                                onPress={() => {
                                    setThemeColor('#27AE60');
                                    setIsOpen(!isOpen);
                                }}
                                bg="#27AE60"
                                variant="solid"
                                marginBottom={2}
                            >
                                <ButtonIcon as={Palette} />
                            </Button>
                            <Button
                                borderRadius="$full"
                                size="md"
                                p="$3.5"
                                onPress={() => {
                                    setThemeColor('#6FCF97');
                                    setIsOpen(!isOpen);
                                }}
                                bg="#6FCF97"
                                variant="solid"
                                marginBottom={2}
                            >
                                <ButtonIcon as={Palette} />
                            </Button>
                            <Button
                                borderRadius="$full"
                                size="md"
                                p="$3.5"
                                onPress={() => {
                                    setThemeColor('#2F80ED');
                                    setIsOpen(!isOpen);
                                }}
                                bg="#2F80ED"
                                variant="solid"
                                marginBottom={2}
                            >
                                <ButtonIcon as={Palette} />
                            </Button>
                            <Button
                                borderRadius="$full"
                                size="md"
                                p="$3.5"
                                onPress={() => {
                                    setThemeColor('#F2994A');
                                    setIsOpen(!isOpen);
                                }}
                                bg="#F2994A"
                                variant="solid"
                                marginBottom={2}
                            >
                                <ButtonIcon as={Palette} />
                            </Button>
                        </VStack> : <></>}
                        <HStack >
                            <Button
                                borderRadius="$full"
                                size="md"
                                p="$4"
                                onPress={() => { setIsOpen(!isOpen); }}
                                bg={themeColor}
                                variant="solid"
                            >
                                <ButtonIcon as={SettingsIcon} />
                            </Button>
                        </HStack>
                    </Box>
                </HStack>
            </Box >
        </React.Fragment >
    );
}
