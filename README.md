# MyNote

## Some key points in mind

### McAfee blocks 8081 port

sudo launchctl remove com.mcafee.agent.macmn
sudo lsof -i tcp:8081

### Vector icon ios duplicated issue

node_modules/react-native-vector-icons/RNVectorIcons.podspec, remove the s.resources = "Fonts/\*.ttf"
npx pod-install

### At least one permission fix

node_modules --> react-native-permission --> RNPermissions.m
in this file Search for "No permission handler detected"
and comment this line "RCTLogError(@"%@", message)"

### File for API key

remember copy setting.json

### Android studio build issue

Android stuio, preference -> build -> gradle JDK, make sure JDK 11

### Android studio gradle lock issue

Delete .gradle/x.x.x from android/app folder

### Debug physical device

1. sudo usermod -aG plugdev $LOGNAME
2. apt-get install android-sdk-platform-tools-common
3. adb reverse tcp:8081 tcp:8081
