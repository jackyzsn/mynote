# MyNote

## Some key points in mind

sudo launchctl remove com.mcafee.agent.macmn
sudo lsof -i tcp:8081

node_modules/react-native-vector-icons/RNVectorIcons.podspec, remove the s.resources = "Fonts/\*.ttf"
npx pod-install

node_modules --> react-native-permission --> RNPermissions.m
in this file Search for "No permission handler detected"
and comment this line "RCTLogError(@"%@", message)"

remember copy setting.json

Android stuio, preference -> build -> gradle JDK, make sure JDK 11

Debug physical device: adb reverse tcp:8081 tcp:8081
