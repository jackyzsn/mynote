# MyNote to maintain passwords

## New react native project

```
npx @react-native-community/cli@latest init MyNote --version 2.0.0
```

## Build react native apk

```
react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

cd android

./gradlew assembleDebug

./gradlew assembleRelease
```

## Debug on physical phone

```
# find device address
lsusb

# Add udev rule
echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="04e8", MODE="0666", GROUP="plugdev"' | sudo tee /etc/udev/rules.d/51-android-usb.rules

# Check adb device name
adb devices

# Start debug the device
adb -s 9885e6434b52395951 reverse tcp:8081 tcp:8081
```

## Debug on emulator

```
# Check avaliable emulators
~/Android/Sdk/tools$ ./emulator -list-avds

# Start specific emulator
~/Android/Sdk/tools$ ./emulator -avd Medium_Phone_API_35
```

## Debug

```
# Start dev server
npm start

# Debug app
npm run android
```
