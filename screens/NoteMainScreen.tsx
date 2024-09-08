import React, { useContext, useEffect } from 'react';
import { Dimensions, Alert } from 'react-native';

import { Center, Button, Text, Box, useToast, Toast, VStack, ToastTitle, ToastDescription } from '@gluestack-ui/themed';
import theme from '../resources/theme.json';
import { useTranslation } from 'react-i18next';
import { syncToCloud } from '../utils/dbhelper';
import DeviceInfo from 'react-native-device-info';
import { MynoteContext } from '../context/mynoteContext';
import { MynoteContextType, ScreenType } from '../@types/mynote.d';

const deviceWidth = Dimensions.get('window').width;
const contentWidth = deviceWidth - theme.content_margin;

interface NoteMainScreenProps {
    navigation: any;
}

export function NoteMainScreen({ navigation }: NoteMainScreenProps): JSX.Element {
    const { mynoteConfig, changeScreen } = useContext(MynoteContext) as MynoteContextType;
    const { t } = useTranslation();
    const toast = useToast();

    const syncCallback = (rtnCode: string) => {
        if (rtnCode === '00') {
            toast.show({
                placement: 'top',
                duration: theme.toast_delay_duration,
                render: ({ id }) => {
                    const toastId = 'success-toast-' + id;
                    return (
                        <Toast nativeID={toastId} action="attention" variant="solid" bgColor={mynoteConfig.config.favColor}>
                            <VStack space="xs" w="80%" >
                                <ToastTitle>{t('message')}</ToastTitle>
                                <ToastDescription>
                                    {t('sync_success')}
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
                        <Toast nativeID={toastId} action="attention" variant="solid" bgColor={theme.toast_fail_bg_color}>
                            <VStack space="xs" w="80%" >
                                <ToastTitle>{t('message')}</ToastTitle>
                                <ToastDescription>
                                    {t('sync_failed')}
                                </ToastDescription>
                            </VStack>
                        </Toast>
                    );
                },
            });
        }
    };

    useEffect(() => {
        changeScreen(ScreenType.NOTE_MAIN);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Center>
            <Box width={contentWidth}>
                <Box alignItems="center" w="100%">
                    <Button
                        w="100%"
                        mt="$5"
                        bgColor={mynoteConfig.config.favColor}
                        onPress={() => {
                            navigation.navigate('BrowseNote');
                        }}>
                        <Text color={theme.btn_txt_color}>{t('browse_all_notes')}</Text>
                    </Button>
                    <Button
                        mt="$5"
                        w="100%"
                        bgColor={mynoteConfig.config.favColor}
                        onPress={() => {
                            navigation.navigate('NewNote');
                        }}>
                        <Text color={theme.btn_txt_color}>{t('add_new_note')}</Text>
                    </Button>
                    <Button
                        mt="$5"
                        w="100%"
                        bgColor={mynoteConfig.config.favColor}
                        onPress={() => {
                            navigation.navigate('SearchExistingNotes');
                        }}>
                        <Text color={theme.btn_txt_color}>{t('search_note')}</Text>
                    </Button>
                    <Button
                        mt="$5"
                        w="100%"
                        bgColor={mynoteConfig.config.favColor}
                        onPress={() => {
                            navigation.navigate('ImportNote');
                        }}>
                        <Text color={theme.btn_txt_color}>{t('import_note_file')}</Text>
                    </Button>
                    <Button
                        mt="$5"
                        w="100%"
                        bgColor={mynoteConfig.config.favColor}
                        onPress={async () => {
                            try {
                                const uniqueId = await DeviceInfo.getUniqueId();
                                const buildId = await DeviceInfo.getBuildId();
                                const userAgent = await DeviceInfo.getUserAgent();
                                const deviceId = `${buildId}(${uniqueId})`;
                                syncToCloud(deviceId, userAgent, syncCallback);
                            } catch (error) {
                                console.error(error);
                                Alert.alert(t('error_occurred'), t('sync_failed'));
                            }
                        }}>
                        <Text color={theme.btn_txt_color}>{t('sync_to_cloud')}</Text>
                    </Button>
                    <Button
                        mt="$5"
                        w="100%"
                        bgColor={mynoteConfig.config.favColor}
                        onPress={() => {
                            navigation.navigate('RestoreCloud');
                        }}>
                        <Text color={theme.btn_txt_color}>{t('restore_from_cloud')}</Text>
                    </Button>
                </Box>
            </Box>
        </Center>
    );
}
