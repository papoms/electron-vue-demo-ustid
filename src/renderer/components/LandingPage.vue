<template>
  <div id="wrapper">
    <h1 class="title">USTID Checker</h1>
    <div class="notification is-info" v-if="showError">
      <button class="delete" @click="showError = false"></button>
       <h2>{{ errorTitle }}</h2>
       {{errorMessage}}
    </div>


    <form>

      <div class="field">
        <label class="label" for="ustid_your">Eigene USTID</label>
        <div class="control has-icons-right" v-bind:class="{'is-loading': loading}">
          <input class="input" v-bind:class="ustid_your_classObject" type="text" id="ustid_your" v-model="formData.ustid_your" placeholder="DE123456789" :disabled="loading">
          <span class="icon is-small is-right"><i class="fa fa-check"></i></span>
        </div>

      </div>

      <div class="field">
        <label class="label" for="ustid_check">USTID</label>
        <div class="control has-icons-right" v-bind:class="{'is-loading': loading}">
          <input class="input" v-bind:class="ustid_check_classObject" type="text" id="ustid_check" v-model="formData.ustid_check" placeholder="ATU12345678" :disabled="loading">
          <span class="icon is-small is-right"><i class="fa fa-check"></i></span>
        </div>
      </div>


      <div class="field">
        <label class="label" for="firma">Firmenname inkl. Rechtsform</label>
        <div class="control has-icons-right" v-bind:class="{'is-loading': loading}">
          <input class="input" type="text" id="firma" v-model="formData.firma" v-bind:class="getFieldClassObject('Name')" placeholder="Beispiel GmbH" :disabled="loading">
          <span class="icon is-small is-right"><i class="fa fa-check"></i></span>
        </div>
      </div>

      <div class="field">
        <label class="label" for="ort">Ort</label>
        <div class="control has-icons-right" v-bind:class="{'is-loading': loading}">
          <input class="input" type="text" id="ort" v-model="formData.ort" v-bind:class="getFieldClassObject('Ort')" placeholder="Berlin" :disabled="loading">
          <span class="icon is-small is-right"><i class="fa fa-check"></i></span>
        </div>
      </div>

      <div class="field">
        <label class="label" for="plz">PLZ</label>
        <div class="control has-icons-right" v-bind:class="{'is-loading': loading}">
          <input class="input" type="text" id="plz" v-model="formData.plz" v-bind:class="getFieldClassObject('PLZ')" placeholder="10115" :disabled="loading">
          <span class="icon is-small is-right"><i class="fa fa-check"></i></span>
        </div>
      </div>

      <div class="field">
        <label class="label" for="str">Straße</label>
        <div class="control has-icons-right" v-bind:class="{'is-loading': loading}">
          <input class="input" type="text" id="str" v-model="formData.str" v-bind:class="getFieldClassObject('Str')" placeholder="Platz der Republik 1" :disabled="loading">
          <span class="icon is-small is-right"><i class="fa fa-check"></i></span>
        </div>
      </div>

      <div class="field">
        <div class="control has-icons-right">
          <button class="button is-primary is-fullwidth is-medium" @click.prevent="check" :disabled="loading">Jetzt prüfen</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>

  import https from 'https'
  import {parseString} from 'xml2js'
  import {errorCodes} from '@/utils'

  export default {
    name: 'landing-page',
    data () {
      return {
        formData: {
          ustid_your: 'DE815358108',
          ustid_check: 'ATU69116734',
          firma: '',
          ort: '',
          plz: '',
          str: '',
        },
        loading: false,
        lastResponse: {},
        showError: false,      
      }
    },
    computed: {
      errorCode () {
        return parseInt(this.lastResponse.ErrorCode)
      },
      errorTitle () {
        return 'Fehlercode '+ this.errorCode
      },
      errorMessage () {
        return errorCodes[parseInt(this.lastResponse.ErrorCode)]
      },
      ustid_check_classObject () {
        return {
          'is-success': [200, 216, 218, 219].indexOf(this.errorCode) > -1, 
          'is-danger': [201, 202, 203, 204, 209, 210, 212 ].indexOf(this.errorCode) > -1  
        }
      },
      ustid_your_classObject () {
        return {
          'is-success': [200, 216, 218, 219].indexOf(this.errorCode) > -1, 
          'is-danger': [206,207,208,214].indexOf(this.errorCode) > -1  
        }
      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },


      /*
        Folgende Werte sind als Ergebnis möglich:

        A = stimmt überein
        B = stimmt nicht überein
        C = nicht angefragt
        D = vom EU-Mitgliedsstaat nicht mitgeteilt
        
        Erg_Name
        Ergebnis für den angefragten Namen der Firma
        Erg_Ort
        Ergebnis für den angefragten Ort der Firma
        Erg_PLZ
        Ergebnis für die angefragte Postleitzahl der Firma
        Erg_Str
        Ergebnis für die angefragte Strasse der Firma

      */
      getFieldClassObject (fieldName) {
        return {
          'is-success' : this.lastResponse[`Erg_${fieldName}`] == 'A',
          'is-danger'  : this.lastResponse[`Erg_${fieldName}`] == 'B'
        }

      },
      check () {
        this.query(this.formData.ustid_your, this.formData.ustid_check, this.formData.firma, this.formData.ort, this.formData.plz, this.formData.str)
      },

      /*
        Query the official USTID Api
        ustid_your and ustid are mandatory.
        The rest is optional but for an extended check you need to provide at least firma and ort
        Dont set druck to ja. 
        */
        query (ustid_your, ustid_check, firma = '', ort = '', plz = '', str = '', druck = 'nein') {

          this.loading = true
          console.log('Check UST Function')


          let url = `https://evatr.bff-online.de/evatrRPC?UstId_1=${ustid_your}&UstId_2=${ustid_check}&Firmenname=${firma}&Ort=${ort}&PLZ=${plz}&Strasse=${str}&Druck=${druck}`

          console.log(url)

        // Versuch mit HTTPS
        https.get(url, res => {

          res.setEncoding('utf8');
          let rawData = '';
          
          // Collect Response
          res.on('data', (chunk) => { rawData += chunk; })
          
          res.on('end', () => {
            
            let response = this.parseXML(rawData)
            
            // Wenn die API ein Problem meldet, zeige dem User den Fehler an.
            if (response.ErrorCode != '200'){
              this.showError = true
            } else {
              this.showError = false
            }

            this.lastResponse = response

            this.loading = false
          })
        }).on('error', (e) => {
          console.error(e)
          this.loading = false
        });
      },

      parseXML(xml){
        let response = {}

        try {
          parseString(xml, function (err, result) {
            window.re = result
            
            if (err == null && typeof result === 'object'){
              
              
              // Loop trough all response pairs
              for (var pair of result.params.param){
              
                // full "path" to key / Value
                // KEY:   window.re.params.param[0].value[0].array[0].data[0].value[0].string
                // VALUE: window.re.params.param[0].value[0].array[0].data[0].value[1].string

                let key = pair.value[0].array[0].data[0].value[0].string
                let value = pair.value[0].array[0].data[0].value[1].string[0]

                response[key] = value
              }

              console.log(response)
              return response
              
            } else {
              console.log('error processing (XML) Response')
            }

          });
        } catch (e) {
          console.error(e.message)
        } finally {
          return response
        }
      }

    },
    mounted () {
      console.log('landing page mounted')
    }
  }
</script>

<style>

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-weight: lighter;
    font-size: 16px;
  }

  h1, h2{
    font-weight:bold;
    font-size:1.7em;
  }

  div#wrapper {
    margin:40px;
  }

  .input {
    border-width:0px;
    border-color:#fff;
    border-bottom:2px solid #aaa;
    background-color:#eee;
  }

  .control .icon i{
    visibility: hidden;
  }
  .is-success + .icon i{
    color:#23d160;
    visibility: visible;
  }
  .is-success {
    color:#23d160;
  }

  .notification, .notification.is-primary, .notification.is-info {
    background-color: rgba(0,209,178, 0.9);
    background-color: rgba(50, 115, 220, 1);

    box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
    z-index:999999999;
    font-weight:normal;
    position:fixed;
    left:0;
    top:10vh;
    margin:20px;
  }

</style>
