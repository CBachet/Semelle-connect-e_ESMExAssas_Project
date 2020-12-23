# Semelle-connect-e_ESMExAssas_Project
Le code Arduino utilisé dans notre projet de semelle connectée lors de notre 4ème année d'étude à l'ESME Sudria (école d'ingénieur française) et en collaboration avec l'école Assas (école de kinésithérapie). (2020)

Le but de ce projet était de récupérer des informations de pressions plantaires d'un patient pendant sa marche et de les afficher sur une application mobile/tablette codé en Ionic. Le code Arduino permet de récupérer des informations depuis des capteurs de pressions, les découper et les envoyer via BLE (Bluetooth Low Energy) à l'application.

Uniquement le code de l'application permettant de récupérer le signal BLE est présent dans le fichier "Application".

Pour faire fonctionner le BLE sous Ionic, ne pas oublier de faire toutes les installations necessaire pour faire les import du fichier "folder.page.ts": https://ionicframework.com/docs/native/ble/

----------

The Arduino code used in our connected sole project during our 4th year at ESME Sudria (French engineering school) in collaboration with Assas (physiotherapy school). (2020)

The aim of this project was to retrieve plantar pressure information from a walking patient and display them on a mobile / tablet application. The Arduino code is used to retrieve information from pressure sensors, cut them up and send them via BLE (Bluetooth Low Energy) to the application.

Only the application code used to retrieve the BLE signal is present in the "Application" file.

For the BLE to work with Ionic, don't forget to do all the necessary installations to use same import as the "folder.page.ts" file: https://ionicframework.com/docs/native/ble/
