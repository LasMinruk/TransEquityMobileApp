import {View, Text, StyleSheet, ScrollView, Image, TouchableOpacity} from "react-native";
import {COLORS} from "@/constants/CollorPallet";
import {TextInput} from "react-native-paper";
import {useState} from "react";
const logo = require('../../../../assets/images/logo/logo_t.png');

export default function SignUpVerifyEmailScreen({navigation}: any){

    const [otp, setOtp] = useState('');

    return(
        <ScrollView style={styles.container}>
            <View style={styles.logoWrapper}>
                <Image source={logo} style={styles.logo} resizeMode={'contain'}/>
            </View>

            <Text style={styles.verifyEmailText}> Verify your Email</Text>
            <View style={styles.inputOuter}>
                <View style={styles.formGroup}>
                    <TextInput
                        label="Otp"
                        value={otp}
                        keyboardType={'decimal-pad'}
                        onChangeText={text => setOtp(text)}
                    />
                </View>
                <TouchableOpacity
                    onPress={() => {navigation.navigate('SignUp')}}
                    style={styles.changeEmail}>
                    <Text style={styles.changeEmailText}>Change Email</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {navigation.navigate()}}
                    style={styles.changeEmail}>
                    <Text style={styles.changeEmailText}>(30) Resend Email</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {navigation.navigate('Process')}}
                    style={styles.verifyButton}>
                    <Text style={styles.verifyButtonText}>Verify</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: COLORS.light
    },
    logoWrapper: {
        alignItems: 'center',
        marginTop: 20
    },
    logo: {
        width: 200,
        height:60
    },
    verifyEmailText : {
        fontSize: 16,
        marginTop: 20
    },
    inputOuter: {
        marginTop: 0
    },
    formGroup: {
        marginTop: 10
    },
    changeEmail: {
        alignItems: 'flex-end',
        marginTop: 10
    },
    changeEmailText: {
        color: COLORS.blue,
        textDecorationLine: 'underline'
    },
    resendEmail: {
        textAlign: "right",
        marginTop: 10
    },
    verifyButton: {
        backgroundColor: COLORS.blue,
        marginTop: 30,
        height: 50,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center"
    },
    verifyButtonText: {
        color: COLORS.light
    }


})
