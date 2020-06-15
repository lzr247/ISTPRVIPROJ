const http = require('http')
const fs = require('fs')
const url = require('url')
const querystring = require('query-string')
const putanja = 'oglasi.json'


http.createServer(function(req, res){

    let urlObj = url.parse(req.url, true, false);

    if(req.method == 'GET'){
        
        if(urlObj.pathname == '/sviOglasi'){
            response = sviOglasi();
            res.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Svi aktivni oglasi</title>
                <style>
                    table, th, td {
                        border: 1px solid black;
                    }
                    th,td {
                        padding: 5px 12px;
                    }
                    #container{
                        text-align:left;
                    }
                    #dugme1, #dugme2{
                        width: 300px;
                        height: 40px;
                        display:inline;
                    }
                </style>
            </head>
            <body>
                <h1>Svi aktivni oglasi</h1>
                <a style="font-size:25px" href="/dodajOglas">Dodaj oglas</a>
                <br>
                <br>
                <div id='container'>
                    <form action='/sortirajCenuAsc' method='POST'>
                        <button type='submit' style="font-size:20px" id='dugme1' value='asc'>Sortiraj po ceni rastuće</button>
                        
                    </form>
                    <form action='/sortirajCenuDesc' method='POST'>
                        <button type='submit' style="font-size:20px" id='dugme2' value='desc'>Sortiraj po ceni opadajuće</button>
                    </form>
                </div><br>
                <div id="prikaz">
                    <table>
                        <thead>
                            <tr>
                                <th>Kategorija oglasa:</th>
                                <th>Datum isteka:</th>
                                <th>Cena:</th>
                                <th>Tekst oglasa:</th>
                                <th>Oznaka oglasa:</th>
                                <th>E-pošta oglašivača privatna:</th>
                                <th>E-pošta oglašivača službena:</th>
                                <th>Izmeni oglas</th>
                                <th>Obriši oglas</th> 
                            </tr>
                        </thead>               
                        <tbody>
            `);
            for(let o of response){
                res.write(`
                <tr>
                <td>${o.kategorijaOglasa}</td>
                `)
                res.write(`<td>${o.datumIsteka.dan+"."+o.datumIsteka.mesec+"."+o.datumIsteka.godina}</td>`)
                res.write(`
                <td>${o.cena.text+" "+o.cena.valuta}</td>
                <td>${o.tekstOglasa}</td>
                <td>${o.oznakaOglasa}</td>
                `)
                for(let e of o.epostaOglasivaca){
                    res.write(`<td>${e.text}</td>`)
                }
                res.write(`
                
                <td><a href='/izmeniOglas?id=${o.id}'>Izmeni oglas</a></td>
                <td>
                    <form action='/obrisiOglas' method='POST'>
                        <input type='hidden' name='id' value='${o.id}'>
                        <button type='submit'>Obriši oglas</button>
                    </form>
                </td>
            </tr>
                `);
            }

        }
        
        if(urlObj.pathname == '/dodajOglas'){
            res.write(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Dodaj oglas</title>
                    <style>
                        table, th, td {
                        border: 1px solid black;
                        border-collapse: collapse;
                        }
                        th, td {
                        padding: 5px 12px;
                        text-align: left;    
                        }
                        #dugme{
                            margin:auto;
                            display:block;
                        }
                    </style>
                </head>
                <body>
                    <h1>Dodaj oglas</h1>
                    <a href="/sviOglasi" style="font-size:25px">Svi aktivni oglasi</a>
                    <br><br>
                    <form action='/dodajOglas' method='POST'>
                        <table style='width:30%'>
                            <tr>
                                <td>Kategorija oglasa:</td>
                                <td><input type='text' name='kategorijaOglasa'></td>
                            </tr>
                            <tr>
                                <td>Dan isteka oglasa:</td>
                                <td><input type='number' name='danIsteka'></td>
                            </tr>
                            <tr>
                                <td>Mesec isteka oglasa:</td>
                                <td><input type='number' name='mesecIsteka'></td>
                            </tr>
                            <tr>
                                <td>Godina isteka oglasa:</td>
                                <td><input type='number' name='godinaIsteka'></td>
                            </tr>
                            <tr>
                                <td>Cena:</td>
                                <td><input type='number' name='cena'></td>
                            </tr>
                            <tr>
                                <td>Valuta:</td>
                                <td><input type='text' name='valuta'></td>
                            </tr>
                            <tr>
                                <td>Tekst oglasa:</td>
                                <td><input type='text' name='tekstOglasa'></td>
                            </tr>
                            <tr>
                                <td>Oznaka oglasa 1:</td>
                                <td><input type='text' name='oznakaOglasa1'></td>
                            </tr>
                            <tr>
                                <td>Oznaka oglasa 2:</td>
                                <td><input type='text' name='oznakaOglasa2'></td>
                            </tr>
                            <tr>
                                <td>Oznaka oglasa 3:</td>
                                <td><input type='text' name='oznakaOglasa3'></td>
                            </tr>
                            <tr>
                                <td>E-mail privatni:</td>
                                <td><input type='text' name='emailPrivatni'></td>
                            </tr>
                            <tr>
                                <td>E-mail službeni:</td>
                                <td><input type='text' name='emailSluzbeni'></td>
                            </tr>
                            <tr>        
                               <td colspan='2' text-align='center'><button type='submit' style="font-size:30px" id='dugme'>Dodaj oglas</button></td> 
                            </tr>
                        </table>
                       
                    </form>
                </body>
                </html>
            `);
        }

        if(urlObj.pathname == '/izmeniOglas'){

            let oglasi = sviOglasi();

            let oglas = oglasi.find(x => x.id == urlObj.query.id);

            res.write(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Izmena informacija o oglasu</title>
                    <style>
                        table, th, td {
                        border: 1px solid black;
                        border-collapse: collapse;
                        }
                        th, td {
                        padding: 5px;
                        text-align: left;    
                        }
                        #dugme{
                            margin:auto;
                            display:block;
                        }
                    </style>
                </head>
                <body>
                    <h1>Izmena informacija o oglasu</h1>
                    <a href="/sviOglasi">Povratak na sve oglase</a>
                    <br><br>
                    <form action='/izmeniOglas' method='POST'>

                        <table style='width:30%'>
                            <tr>
                                <td>ID:</td>
                                <td><input type='number' name='id' value='${oglas.id}' readonly></td>
                            </tr>
                            <tr>
                                <td>Kategorija oglasa:</td>
                                <td><input type='text' name='kategorijaOglasa' value=${oglas.kategorijaOglasa} required></td>
                            </tr>
                            <tr>
                                <td>Dan isteka oglasa:</td>
                                <td><input type='number' name='danIsteka' value=${oglas.datumIsteka.dan}></td>
                            </tr>
                            <tr>
                                <td>Mesec isteka oglasa:</td>
                                <td><input type='number' name='mesecIsteka' value=${oglas.datumIsteka.mesec}></td>
                            </tr>
                            <tr>
                                <td>Godina isteka oglasa:</td>
                                <td><input type='number' name='godinaIsteka' value=${oglas.datumIsteka.godina}></td>
                            </tr>
                            <tr>
                                <td>Cena:</td>
                                <td><input type='number' name='cena' value=${oglas.cena.text}></td>
                            </tr>
                            <tr>
                                <td>Valuta:</td>
                                <td><input type='text' name='valuta' value=${oglas.cena.valuta}></td>
                            </tr>
                            <tr>
                                <td>Tekst oglasa:</td>
                                <td><input type='text' name='tekstOglasa' value=${oglas.tekstOglasa}></td>
                            </tr>
                            <tr>
                                <td>Oznaka oglasa 1:</td>
                                <td><input type='text' name='oznakaOglasa1' value=${oglas.oznakaOglasa[0]}></td>
                            </tr>
                            <tr>
                                <td>Oznaka oglasa 2:</td>
                                <td><input type='text' name='oznakaOglasa2' value=${oglas.oznakaOglasa[1]}></td>
                            </tr>
                            <tr>
                                <td>Oznaka oglasa 3:</td>
                                <td><input type='text' name='oznakaOglasa3' value=${oglas.oznakaOglasa[2]}></td>
                            </tr>
                            <tr>
                                <td>E-mail privatni:</td>
                                <td><input type='text' name='emailPrivatni' value=${oglas.epostaOglasivaca[0].text}></td>
                            </tr>
                            <tr>
                                <td>E-mail službeni:</td>
                                <td><input type='text' name='emailSluzbeni' value=${oglas.epostaOglasivaca[1].text}></td>
                            </tr>
                            <tr>        
                               <td colspan='2' text-align='center'><button type='submit' style="font-size:30px" id='dugme'>Izmeni podatke o oglasu</button></td> 
                            </tr>
                        </table>

                    </form>
                </body>
                </html>
            `)
        }
    }
    else if(req.method == 'POST'){
        
        if(urlObj.pathname == '/dodajOglas'){
            var body = '';
            req.on('data',function(data){
                body += data;
            });
            req.on('end',function(){
                dodajOglas( querystring.parse(body).kategorijaOglasa,
                            parseInt(querystring.parse(body).danIsteka),
                            parseInt(querystring.parse(body).mesecIsteka),
                            parseInt(querystring.parse(body).godinaIsteka),
                            parseInt(querystring.parse(body).cena),
                            querystring.parse(body).valuta,
                            querystring.parse(body).tekstOglasa,
                            querystring.parse(body).oznakaOglasa1,
                            querystring.parse(body).oznakaOglasa2,
                            querystring.parse(body).oznakaOglasa3,
                            querystring.parse(body).emailPrivatni,
                            querystring.parse(body).emailSluzbeni
                        );

                res.writeHead(302,{
                    'Location':'/sviOglasi'
                });
                res.end();
            });
        }

        if(urlObj.pathname == '/obrisiOglas'){
            var body = '';
            req.on('data',function(data){
                body += data;
            });
            req.on('end',function(){
                obrisiOglas(querystring.parse(body).id);
                res.writeHead(302,{
                    'Location':'/sviOglasi'
                });
                res.end();
            })
        }

        if(urlObj.pathname == '/izmeniOglas'){
            var body = '';
            req.on('data', function(data){
                body += data;
            });
            req.on('end', function(){

                izmeniOglas(parseInt(querystring.parse(body).id),
                            querystring.parse(body).kategorijaOglasa,
                            parseInt(querystring.parse(body).danIsteka),
                            parseInt(querystring.parse(body).mesecIsteka),
                            parseInt(querystring.parse(body).godinaIsteka),
                            parseInt(querystring.parse(body).cena),
                            querystring.parse(body).valuta,
                            querystring.parse(body).tekstOglasa,
                            querystring.parse(body).oznakaOglasa1,
                            querystring.parse(body).oznakaOglasa2,
                            querystring.parse(body).oznakaOglasa3,
                            querystring.parse(body).emailPrivatni,
                            querystring.parse(body).emailSluzbeni);
                res.writeHead(302,{
                    'Location':'/sviOglasi'
                });
                res.end();
            })
        }

        if(urlObj.pathname == '/sortirajCenuAsc'){
            var body='';
            req.on('data',function(data){
                body += data;
            });
            req.on('end',function(){
                if(sortirajCenuAsc())
                    console.log('Uspesno sortiranje');
                res.writeHead(302,{
                    'Location':'/sviOglasi'
                });
                res.end();
            })
        }

        if(urlObj.pathname == '/sortirajCenuDesc'){
            var body='';
            req.on('data',function(data){
                body += data;
            });
            req.on('end',function(){
                if(sortirajCenuDesc())
                    console.log('Uspesno sortiranje');
                res.writeHead(302,{
                    'Location':'/sviOglasi'
                });
                res.end();
            })
        }

    }

}).listen(200);

function sviOglasi(){
    let data = fs.readFileSync(putanja);
    let oglasi = JSON.parse(data);
    return oglasi;
}

function dodajOglas(kategorijaOglasa, danIsteka, mesecIsteka, godinaIsteka, cena, valuta, tekstOglasa, oznakaOglasa1, oznakaOglasa2, oznakaOglasa3, emailPrivatni, emailSluzbeni){

    let podatakBroj = fs.readFileSync('id.txt');
    let broj = parseInt(podatakBroj)+1;

    fs.writeFileSync('id.txt',broj,(err)=>{
        if(err)
            throw err;
        else{
            console.log('Uspesan upis!')
        }
    })


    let data = fs.readFileSync(putanja);
    let oglasi = JSON.parse(data);

    let oglas={
        "id":broj,
        "kategorijaOglasa":kategorijaOglasa,
        "datumIsteka":{
            "dan":danIsteka,
            "mesec":mesecIsteka,
            "godina":godinaIsteka
        },
        "cena":{
            "valuta":valuta,
            "text":cena
        },
        "tekstOglasa":tekstOglasa,
        "oznakaOglasa":[
            oznakaOglasa1,
            oznakaOglasa2,
            oznakaOglasa3
        ],
        "epostaOglasivaca":[
            {
                "tip":"privatni",
                "text":emailPrivatni
            },
            {
                "tip":"sluzbeni",
                "text":emailSluzbeni
            }
        ]
    }
    oglasi.push(oglas);

    fs.writeFile(putanja,JSON.stringify(oglasi,null,2),(err)=>{
        if(err)
            throw err;
        else{
            console.log('Uspesan upis!')
        }
    })
}

function obrisiOglas(id){
    let data = fs.readFileSync(putanja);
    let oglasi = JSON.parse(data);
    let pom=[];
    for(let o of oglasi){
        if(o.id!=id){
            pom.push(o);
        }
    }
    oglasi=pom;
    fs.writeFile(putanja,JSON.stringify(oglasi,null,2),(err)=>{
        if(err)
            throw err;
        else{
            console.log('Uspesan upis!')
        }
    })
}

function izmeniOglas(id, kategorijaOglasa, danIsteka, mesecIsteka, godinaIsteka, cena, valuta, tekstOglasa, oznakaOglasa1, oznakaOglasa2, oznakaOglasa3, emailPrivatni, emailSluzbeni){

    let oglasi = sviOglasi();

    let oglas = oglasi.find(x => x.id == id);


    oglas.kategorijaOglasa=kategorijaOglasa;
    oglas.datumIsteka.dan=danIsteka;
    oglas.datumIsteka.mesec=mesecIsteka;
    oglas.datumIsteka.godina=godinaIsteka;
    oglas.cena.text=cena;
    oglas.cena.valuta=valuta;
    oglas.tekstOglasa=tekstOglasa;
    oglas.oznakaOglasa[0]=oznakaOglasa1;
    oglas.oznakaOglasa[1]=oznakaOglasa2;
    oglas.oznakaOglasa[2]=oznakaOglasa3;
    oglas.epostaOglasivaca[0].text=emailPrivatni;
    oglas.epostaOglasivaca[1].text=emailSluzbeni;

    let pomocna=[]

    for(let o of oglasi){
        if(o.id!=id){
            pomocna.push(o)
        }
    }

    pomocna.push(oglas)

    oglasi=pomocna;

    fs.writeFile(putanja,JSON.stringify(oglasi,null,2),(err)=>{
        if(err)
            throw err;
        else{
            console.log('Uspesna izmena i upis!')
        }
    })
}

function sortirajCenuAsc(){

    let oglasi = sviOglasi();

    for(let i=0;i<oglasi.length-1;i++){
        for(let j=i+1;j<oglasi.length;j++){
            if(parseInt(oglasi[i].cena.text)>parseInt(oglasi[j].cena.text)){
                pom = oglasi[i];
                oglasi[i] = oglasi[j];
                oglasi[j] = pom;
            }
        }
    }
    fs.writeFileSync(putanja,JSON.stringify(oglasi,null,2),(err)=>{
        if(err)
            throw err;
        else{
            return true;
        }
    })
}

function sortirajCenuDesc(){

    let oglasi = sviOglasi();

    for(let i=0;i<oglasi.length-1;i++){
        for(let j=i+1;j<oglasi.length;j++){
            if(parseInt(oglasi[i].cena.text)<parseInt(oglasi[j].cena.text)){
                pom = oglasi[i];
                oglasi[i] = oglasi[j];
                oglasi[j] = pom;
            }
        }
    }
    fs.writeFileSync(putanja,JSON.stringify(oglasi,null,2),(err)=>{
        if(err)
            throw err;
        else{
            return true;
        }
    })
}