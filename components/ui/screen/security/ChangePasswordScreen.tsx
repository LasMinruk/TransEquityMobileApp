import {View, Text, StyleSheet, ScrollView, Image, TouchableOpacity} from "react-native";
import {COLORS} from "@/constants/CollorPallet";
import {TextInput} from "react-native-paper";
import {useState} from "react";

const logo = require('../../../../assets/images/logo/logo_t.png');


export default function ChangePasswordScreen({navigation}: any){
    const [email, setEmail] = useState('');

    return(
        <ScrollView style={styles.container}>
            <View style={styles.logoWrapper}>
                <Image source={logo} style={styles.logo} resizeMode={'contain'}/>
            </View>

            <Text style={styles.verifyEmailText}> Verify your Email</Text>
            <View style={styles.inputOuter}>
                <View style={styles.formGroup}>
                    <TextInput
                        label="Root Email here"
                        value={email}
                        onChangeText={text => setEmail(text)}
                    />
                </View>
                <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={() => {navigation.navigate('ResetPasswordVerifyEmail')}}
                >
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
