import React, { useState, useContext, useEffect } from 'react';
import { Dimensions, Alert } from 'react-native';
import {
    Center,
    HStack,
    FlatList,
    Text,
    VStack,
    Icon,
    useToast,
    Box,
    Pressable,
    RadioGroup, RadioIndicator, RadioIcon, RadioLabel, Radio,
    Toast, ToastTitle, ToastDescription,
} from '@gluestack-ui/themed';
import theme from '../resources/theme.json';
import { useTranslation } from 'react-i18next';
import { MynoteContext } from '../context/mynoteContext';
import { MynoteContextType, ScreenType, BackupType } from '../@types/mynote.d';
import { retrieveBackupsMongo, restoreToDBMongo } from '../utils/dbhelper';
import { CircleX, CircleCheck, ArchiveRestore, Circle } from 'lucide-react-native';

const deviceWidth = Dimensions.get('window').width;
const contentWidth = deviceWidth - theme.content_margin;

// Define types for props
type RestoreCloudScreenProps = {
    navigation: {
        navigate: (screen: string) => void;
        addListener: (event: string, callback: () => void) => void;
    };
};

export function RestoreCloudScreen({ navigation }: RestoreCloudScreenProps) {
    const { mynoteConfig, changeScreen } = useContext(MynoteContext) as MynoteContextType;
    const { t } = useTranslation();
    const [backuplist, setBackuplist] = useState<BackupType[]>([]);
    const [selected, setSelected] = useState<string | undefined>('1');

    const toast = useToast();

    // Display an error toast when retrieval fails
    const showError = (): void => {
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
                                {t('retrieve_failed')}
                            </ToastDescription>
                        </VStack>
                    </Toast>
                );
            },
        });
    };

    // Refresh backup list every time the screen gains focus
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            retrieveBackupsMongo(setBackuplist, showError);

        });

        // Clean up the listener when the component is unmounted
        return unsubscribe;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (backuplist.length > 0) {
            setSelected(backuplist[0].uuid);
        }
    }, [backuplist]);

    // Dispatch screen change action on component mount
    useEffect(() => {
        changeScreen(ScreenType.RESTORE_CLOUD);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Callback for when restoration finishes
    const restoreCallback = (rtnCode: string): void => {
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
                                    {t('restore_success')}
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
                                    {t('restore_failed')}
                                </ToastDescription>
                            </VStack>
                        </Toast>
                    );
                },
            });
        }
    };

    // Confirm before restoring from the cloud
    const confirmRestoreFromCloud = (key: string | undefined): void => {
        Alert.alert(
            t('confirm'),
            t('q_restore_from_cloud'),
            [
                {
                    text: t('cancel'),
                    style: 'cancel',
                },
                {
                    text: t('ok'),
                    onPress: () => {
                        if (key) {
                            restoreToDBMongo(key, restoreCallback);
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <Box flex={1} bg="white" width="100%" alignSelf="center">
            <Center justifyContent="flex-start" flex={1}>
                <Box width={contentWidth}>
                    <Box w="100%">
                        <FlatList
                            data={backuplist}
                            keyExtractor={(item: any) => item.uuid}
                            renderItem={(rec: any) => (
                                <Box borderBottomWidth="$1" borderColor={theme.minor_text_color} pl="$4" pr="$5" py="$2">
                                    <HStack space="md" justifyContent="space-evenly" alignItems="center" w="100%">
                                        <RadioGroup value={selected} onChange={setSelected}>
                                            <Radio value={rec.item.uuid} size="md" alignItems="center" isInvalid={false} isDisabled={false}>
                                                <RadioIndicator mr="$2">
                                                    <RadioIcon as={selected === rec.item.uuid ? CircleCheck : Circle} />
                                                </RadioIndicator>
                                                <RadioLabel>
                                                    <VStack>
                                                        <Text color={theme.major_text_color}>{rec.item.device}</Text>
                                                        <Text color={theme.major_text_color}>{rec.item.backupAt}</Text>
                                                    </VStack>
                                                </RadioLabel>
                                            </Radio>
                                        </RadioGroup>
                                    </HStack>
                                </Box>
                            )}
                        />
                    </Box>
                </Box>
            </Center>
            <HStack bg={mynoteConfig.config.favColor} alignItems="center">
                <Pressable
                    cursor="pointer"
                    opacity={!selected ? 0.5 : 1}
                    py="$2"
                    flex={1}
                    disabled={!selected}
                    onPress={() => confirmRestoreFromCloud(selected)}
                >
                    <Center>
                        <Icon mb="$1" as={ArchiveRestore} color="white" size="sm" />
                        <Text color="white" >
                            {t('restore')}
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
        </Box>
    );
}
