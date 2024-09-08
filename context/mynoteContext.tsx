import * as React from 'react';
import { MynoteContextType, Config, MynoteConfig, ScreenType } from '../@types/mynote';

export const MynoteContext = React.createContext<MynoteContextType | null>(null);

const MynoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mynoteConfig, setMynoteConfig] = React.useState<MynoteConfig>(
        {
            config: {
                notegroup: '',
                encryptionkey: '',
                hasPermission: false,
                favColor: '#6FCF97',
            },
            currentScreen: 'HOME',
        }
    );

    const changeScreen = (screenType: ScreenType) => {
        setMynoteConfig({ ...mynoteConfig, currentScreen: screenType });
    };

    const changeConfig = (config: Config) => {
        setMynoteConfig({ ...mynoteConfig, config });
    };

    return (
        <MynoteContext.Provider value={{ mynoteConfig, changeScreen, changeConfig }}>
            {children}
        </MynoteContext.Provider>
    );
};

export default MynoteProvider;




