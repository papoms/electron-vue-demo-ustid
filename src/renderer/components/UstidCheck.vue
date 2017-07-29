<template>
<div id="wrapper">
    
    <h1 class="title">USTID Checker</h1>
    
    <!-- Error Message -->
    <div class="notification" v-if="showError">
        <button class="delete" @click="showError = false"></button>
        <h2 class="title is-2">{{ errorTitle }}</h2>
        <p class="errorMessage">
            {{errorMessage}}
        </p>
        <button class="button is-primary is-fullwidth is-medium" @click="showError = false">Ok, Meldung schließen</button>
    </div>

    <!-- The Input Form -->
    <form>
        <formfield label="Eigene USTID" placeholder="DE123456789" v-model="formData.ownUstid" :loading="loading" :state="getFieldState('ownUstid')"></formfield>
        <formfield label="USTID" placeholder="DE123456789" v-model="formData.checkUstid" :loading="loading" :state="getFieldState('checkUstid')"></formfield>
        <formfield label="Firmenname inkl. Rechtsform" placeholder="Beispiel GmbH" v-model="formData.firma" :loading="loading" :state="getFieldState('Name')"></formfield>
        <formfield label="Ort" v-model="formData.ort" placeholder="Berlin" :loading="loading" :state="getFieldState('Ort')"></formfield>
        <formfield label="PLZ" v-model="formData.plz" placeholder="12345" :loading="loading" :state="getFieldState('PLZ')"></formfield>
        <formfield label="Straße" v-model="formData.str" placeholder="Unter den Linden 1" :loading="loading" :state="getFieldState('Str')"></formfield>

        <div class="field">
            <div class="control">
                <button class="button is-primary is-fullwidth is-medium" @click.prevent="checkAgainstAPI" :disabled="loading">Jetzt prüfen</button>
            </div>
        </div>
    </form>
</div>
</template>

<script>

// Using https because both axios and fetch had problems with CORS
import https from 'https'
import {parseString} from 'xml2js'
// The API errorCodes
import {errorCodes} from '@/utils/errorCodes'
import formField from '@/components/UstidCheck/FormField'

export default {
    name: 'ustid-checker',
    components: {
        'formfield': formField
    },
    data () {
        return {
            formData: {
                ownUstid: 'DE815358108',
                checkUstid: 'ATU69116734',
                firma: 'Coinimal GmbH',
                ort: 'Wien',
                plz: '1070',
                str: 'Burggasse 116/3+3A',
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
    },
    methods: {
        open (link) {
            this.$electron.shell.openExternal(link)
        },
        getFieldState (fieldName) {

            // Validity of the USTIDs are not laid out separately in the API,
            // We rely on the ErrorCodes to set their state
            if (fieldName == 'checkUstid'){
                if ([200, 216, 218, 219].indexOf(this.errorCode) > -1){
                    return 'ok'
                }

                if ([201, 202, 203, 204, 209, 210, 212 ].indexOf(this.errorCode) > -1 ){
                    return 'error'
                }
            }

            if (fieldName == 'ownUstid'){
                if ([200, 216, 218, 219].indexOf(this.errorCode) > -1){
                    return 'ok'
                }

                if ([206,207,208,214].indexOf(this.errorCode) > -1){
                    return 'error'
                }
            }

            // Other Fields are directly addressed in the API
            if (this.lastResponse[`Erg_${fieldName}`] == 'A'){
                return 'ok'
            }

            if (this.lastResponse[`Erg_${fieldName}`] == 'B'){
                return 'error'
            }
            return '' // default
        },
        
        checkAgainstAPI () {
            this.loading = true
            this.query(this.formData.ownUstid, this.formData.checkUstid, this.formData.firma, this.formData.ort, this.formData.plz, this.formData.str)
        },

        /*
        Query the german USTID API
        ownUstid and ustid are mandatory.
        The rest is optional but for an extended check you need to provide at least firma and ort
        Dont set druck to ja or the checking USTID will receive a snake mail letter per request. 
        */
        query (ownUstid, checkUstid, firma = '', ort = '', plz = '', str = '', druck = 'ja') {
            
            let url = `https://evatr.bff-online.de/evatrRPC?UstId_1=${encodeURIComponent(ownUstid)}&UstId_2=${encodeURIComponent(checkUstid)}&Firmenname=${encodeURIComponent(firma)}&Ort=${encodeURIComponent(ort)}&PLZ=${encodeURIComponent(plz)}&Strasse=${encodeURIComponent(str)}&Druck=${encodeURIComponent(druck)}`

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
            
                    if (err == null && typeof result === 'object'){
                           
                        // Loop trough all response pairs
                        for (var pair of result.params.param){

                            // You gotta love their XMl response.
                            let key   = pair.value[0].array[0].data[0].value[0].string
                            let value = pair.value[0].array[0].data[0].value[1].string
                            response[key] = value
                        }
                    } else {
                        console.log('error processing (XML) Response')
                    }
                })
            } catch (e) {
                console.error(e.message)
            } finally {
                return response
            }
        }
    }
}
</script>

<style>
body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-weight: lighter;
    font-size: 16px;
}

div#wrapper {
    margin:40px;
}
  
.control .icon i{
    visibility: hidden;
}

p.errorMessage {
    margin-bottom:20px;
}

.notification{
    position:fixed;
    left:0;
    top:10vh;
    z-index:999;
    margin:20px;
    
    background-color: rgba(50, 115, 220, 1);
    box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
    
    font-weight:normal;
    color:#fff;
}
</style>
