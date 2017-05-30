const Speech = require('@google-cloud/speech');

export function speechToText(filename) {
// Instantiates a client
    const speech = Speech();

    const request = {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US'
    };
    speech.recognize(filename, request)
        .then((results) => {
            results[1].results.forEach(res => {
                console.log('res', res)
                console.log('res.alternatives', res.alternatives)
            })
            const transcription = results[0];
            console.log(`Transcription: ${transcription}`);
        })
        .catch((err) => {
            console.error('ERROR:', err);
        });
// [END speech_sync_recognize]
}