#include <SPI.h>
#include <BLEPeripheral.h>
#include <SD.h>



const char * localName = "nRF52832 semelle";
BLEPeripheral blePeriph;
BLEService bleServ("00000100fe6511eaadc10242ac120002");
BLECharacteristic matrice("00000101fe6511eaadc10242ac120002", BLERead | BLENotify, 12);
BLECharCharacteristic mesureChar("00000102fe6511eaadc10242ac120002", BLERead | BLEWrite);

const int CaptPin1 = A0; //initialisation des pin connecté au capteur
const int CaptPin2 = A1;
const int CaptPin3 = A2;
const int CaptPin4 = A3;
const int CaptPin5 = A4;
const int CaptPin6 = A5;
int fsrReading1;
int fsrReading2;
int fsrReading3;
int fsrReading4;
int fsrReading5;
int fsrReading6;
//int i=0;
int c=1;
File fichierSD;



uint8_t tx_data[12] = {0};


void setup() {
Serial.begin(115200);
  
  // put your setup code here, to run once:
  setupBLE();
 Serial.println("fin setup ble") ;
 if(!SD.begin(22)){
  Serial.println(F("Pas de carte sd"));
  }
  else{
  Serial.println(F("Carte sd connectée"));
  }
}

void loop() {
  
  
  BLECentral central = blePeriph.central();
    if (central) {
    Serial.print(F("Connected to central: "));
    Serial.println(central.address());
    while (central.connected()) {
          
      {
        int mesureState = mesureChar.value();
        fichierSD = SD.open("données.txt",FILE_WRITE);
        if (mesureState)
        {
        // central still connected to peripheral
        matrice.setValue(tx_data,12);
        fsrReading1 = analogRead(CaptPin1); //lecture des valeurs sortie pas les capteurs
        fsrReading2 = analogRead(CaptPin2);
        fsrReading3 = analogRead(CaptPin3);
        fsrReading4 = analogRead(CaptPin4);
        fsrReading5 = analogRead(CaptPin5);
        fsrReading6 = analogRead(CaptPin6);

        tx_data[0] = (uint8_t)(fsrReading1 & 0xff);         //8 dernier bits  
        tx_data[1] = (uint8_t)((fsrReading1 & 0xff) >> 8); // 8 premiers bits du reading1
        tx_data[2] = (uint8_t)(fsrReading2 & 0xff);
        tx_data[3] = (uint8_t)((fsrReading2 & 0xff) >> 8);
        tx_data[4] = (uint8_t)(fsrReading3 & 0xff);
        tx_data[5] = (uint8_t)((fsrReading3 & 0xff) >> 8);
        tx_data[6] = (uint8_t)(fsrReading4 & 0xff);
        tx_data[7] = (uint8_t)((fsrReading4 & 0xff) >> 8);
        tx_data[8] = (uint8_t)(fsrReading5 & 0xff);
        tx_data[9] = (uint8_t)((fsrReading5 & 0xff) >> 8);
        tx_data[10] = (uint8_t)(fsrReading6 & 0xff);
        tx_data[11] = (uint8_t)((fsrReading6 & 0xff) >> 8);
        
        
        Serial.print(fsrReading1);
        Serial.print("-");
        Serial.print(fsrReading2);
        Serial.print("-");
        Serial.print(fsrReading3);
        Serial.print("-");
        Serial.print(fsrReading4);
        Serial.print("-");
        Serial.print(fsrReading5);
        Serial.print("-");
        Serial.println(fsrReading6);
        
        if(fichierSD){
         fichierSD.print("mesure numéro:");
         fichierSD.println(c);
         fichierSD.print(fsrReading1);
         fichierSD.print(fsrReading2);
         fichierSD.print(fsrReading3);
         fichierSD.print(fsrReading4);
         fichierSD.print(fsrReading5);
         fichierSD.println(fsrReading6);
         c++;
        }
      
        delay(500);
        if (mesureState==0){
          if(fichierSD){
            fichierSD.println("fin de la mesure");
          }
           fichierSD.close();
         }
        }
        }
        } 
    // central disconnected
    Serial.print(F("Disconnected from central: "));
 
    
    Serial.println(central.address());
  }
}

void setupBLE()
{
  blePeriph.setDeviceName(localName);
  blePeriph.setLocalName(localName);
  blePeriph.setAdvertisedServiceUuid(bleServ.uuid());

  blePeriph.addAttribute(bleServ);
  blePeriph.addAttribute(matrice);
  blePeriph.addAttribute(mesureChar);

  blePeriph.begin();
}
