/*
Query the official USTID Api
ustid_your and ustid are mandatory.
The rest is optional but for an extended check you need to provide at least firma and ort
Dont set druck to ja. 
*/
function query (ustid_your, ustid_check, firma = '', ort = '', plz = '', str = '', druck = 'nein') {

    let url = `https://evatr.bff-online.de/evatrRPC?UstId_1=${ustid_your}&UstId_2=${ustid_check}&Firmenname=${firma}&Ort=${ort}&PLZ=${plz}&Strasse=${str}&Druck=${druck}`
    console.log(url)
    
    https.get(url, res => {

        res.setEncoding('utf8');
        let rawData = '';

        // Collect Response
        res.on('data', (chunk) => {
            rawData += chunk;
        })
        // When finished loading
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
    })
}


function parseXML(xml){
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

                return response
            }
        })
    } catch (e) {
        console.error(e.message)
    } finally {
        return response
    }
}

