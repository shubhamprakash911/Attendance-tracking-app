import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import axios from "axios";

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);

    //check if current time is between 8am and 10am then check in else check out(max 5pm)
    const currentTime = new Date().getHours();
    const isCheckInTime = currentTime >= 8 && currentTime <= 10;
    console.log(currentTime, currentTime < 8);

    if (currentTime < 8 || currentTime > 17) {
      // Display error message if trying to check in before 8 am or check out after 5 pm.
      alert("School/college hours are between 8 am and 5 pm.");
      return;
    }

    const payload = JSON.parse(data);
    console.log(payload, "payload");

    // Make a request to your backend with the scanned data
    const endpoint = isCheckInTime
      ? "http://192.168.115.194:8000/attendance/check-in"
      : "http://192.168.115.194:8000/attendance/check-out";
    // Make a request to your backend with the scanned data
    axios
      .post(endpoint, payload)
      .then((response) => {
        console.log(response.data);
        alert(response.data.message);
      })
      .catch((error) => {
        console.error(
          "Error making request to backend:",
          error?.response?.data?.message
        );
        alert(
          error?.response?.data?.message || "Error making request to backend"
        );
      });
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
  },
});
