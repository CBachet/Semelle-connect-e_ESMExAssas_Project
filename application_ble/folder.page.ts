import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
//import necessaire à l'utilisation du bluetooth
import { Timer } from './timer';
import { BLE } from '@ionic-native/ble/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';


let connecte : boolean = false;
  

let value ;
@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder: string;
  public connecte : boolean = false;
  public connectEtat : string = "Non connecté";
  public mesure = false;
  //public bleInit;
 


  constructor(private activatedRoute: ActivatedRoute,private ble: BLE, private geolocation:Geolocation,private ngzone: NgZone) { 
  }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');  
    this.devices = [];
       
  }

  
  ///Recherche avec BLE

  onDeviceDiscovered(device){
    console.log("device found: "+ device.name +"| id:"+device.id ); //pour afficher les informations de chaque appareils à proximité
    
    this.devices.push(device); 
  }
  
  scan(){
    this.devices = [];
    console.log("Start Scan");
    navigator.geolocation.getCurrentPosition (function () {}, function () {});
    this.ble.startScan(["00000100-fe65-11ea-adc1-0242ac120002"]).subscribe(device => this.onDeviceDiscovered(device)); //ne va chercher que les appareils avec ce numéro de service(généré dans le code du microcontroleur) => permet de ne faire apparaitre que les appareils voulus
    
    setTimeout(function() {
      this.ble.stopScan(
          function() { console.log("Scan complete"); },
          function() { console.log("stopScan failed"); }
      );
	}, 2000); //arrete automatiquement la recherche au bout de 2 secondes
      
  }

  connectSuccess(){
    console.log("Connexion aux semelles");
    connecte = true;
  }
  
  /// Connexion aux semelles (deviceSelected== appareil choisi apres la recherche BLE cf la page html)
  onConnecte() { //se connecter aux semelles
    console.log('tentative de Connexion aux semelles');
    
    this.ble.autoConnect(this.deviceSelected[1], //connexion automatique a cet appareil si possible
      this.connectSuccess,
      function() {  console.log("Probleme lors de la connexion"); }
      );

      if(connecte == true){
        this.connecte = true;
        this.connectEtat = "Connecté";
      }
    
  }

  onDeconnecte() { //se deconnecter aux semelles
    console.log('Deconnexion des semelles');
    this.ble.disconnect(this.deviceSelected[1]); //deconnexion de l'appareil 
    this.connecte = false;
    this.connectEtat = "Non connecté";
  }


  ///gestion de la mesure 
  actualD : number[] = []; 
  actualG : number[] = [];
  datad : number[][] = [];
  datag : number[][] = [];
  private _timeData;
    
 
  
  onMesure() { //lancer la mesure des valeurs
    var data = new Uint8Array(1);
    data[0]=0x01;
    console.log('Début de la mesure');
    this.ble.writeWithoutResponse(this.deviceSelected[1],"00000100-fe65-11ea-adc1-0242ac120002","00000102-fe65-11ea-adc1-0242ac120002",data.buffer); //va envoyer une notification a l'appareil bluetooth (le microcontroleur) pour commencer l'envoie de données (necessite le numero de l'appareil, le numero de la characteristique entrée dans le code du microcontroleur)
    this.backward();
    this.play();
    this.mesure = true;   
  }

  onArrete() { //arreter la mesure des valeurs
    var data = new Uint8Array(1);
    data[0]=0x00;
    console.log('Fin de la mesure');
    this.ble.writeWithoutResponse(this.deviceSelected[1],"00000100-fe65-11ea-adc1-0242ac120002","00000102-fe65-11ea-adc1-0242ac120002",data.buffer); //va envoyer une notification a l'appareil bluetooth (le microcontroleur) pour arreter l'envoie de données
    this.stop();
    this.mesure = false;
    this.resultats.unshift(new Resultat("user", this._timer.totalSecondes, this.datad, this.datag)); //user si connexion 
    this.datad = [];
    this.datag = [];
  }

  ///Gestion du Timer (pour la mesure) (a mettre dans les autre fonction maintenant que maitrisé?)
  private _timer: Timer = new Timer();

  play() {
      this._timer.start(); 
      this.lireValeur();
  }
  stop() {
      this._timer.stop();
      clearInterval(this._timeData);
  }
  backward() {
      this._timer.reset();
  }

 
//code pour recomposer les mesures coupées par le microcontroleur
  decodeValeur(mesures ){
    var mesureStr : string[] = ["","","","","","","","","","","",""];
    var i =0;
    for(let mesure of mesures){
      if(mesure.toString().length == 1){
        mesureStr[i] = "0"+mesure.toString();
        
      }else{
        mesureStr[i] = mesure.toString();
      }
      i++;
    }
    console.log(mesureStr);

    var correctMesure=[mesureStr[1].concat(mesureStr[0]),
                       mesureStr[3].concat(mesureStr[2]),
                       mesureStr[5].concat(mesureStr[4]),
                       mesureStr[7].concat(mesureStr[6]),
                       mesureStr[9].concat(mesureStr[8]),
                       mesureStr[11].concat(mesureStr[10])];

    i=0;
    for(let mesure of correctMesure){
      
      correctMesure[i] = "0x"+mesure;
      i++;
    }
    return correctMesure;
  }
     
  valResistance(Vout){
    return((1000*33/Vout)-10000); //valeur de resistance en Ohm : Rm*3v3/Vout - Rm
  }
  

  lireValeur(){//récupere la valeur actuelle donnée par chaque capteur et la rajoute à un tableau valeur global pour toute la mesure
    this._timeData = setInterval(() => {
      this.ble.read(this.deviceSelected[1],"00000100-fe65-11ea-adc1-0242ac120002","00000101-fe65-11ea-adc1-0242ac120002").then( function(data : Uint8Array) {
        let view = new Uint8Array(data); 
        value=view;
        
        
      });
      let mesurehexa=this.decodeValeur(value);
      
      var trueValueD : number[] = [];
      var i =0;
      for (let hexa of mesurehexa){
        trueValueD[i] = parseInt(hexa)*45/510;
        i++;
      }

      this.actualD=[trueValueD[0],trueValueD[1],trueValueD[2],trueValueD[3],trueValueD[4],trueValueD[5]];//bluetooth
      this.datad.push(this.actualD);

      this.actualG=[0,0,0,0,0,0];
      this.datag.push(this.actualG);
    }, 500);//temps d'aquisition
  }

}