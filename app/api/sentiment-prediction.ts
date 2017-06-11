var google = require('googleapis');
var prediction = google.prediction('v1.6');

function authorize(callback) {
    google.auth.getApplicationDefault((err, authClient) => {
        if (err) {
            console.log('authentication failed: ', err);
            callback(err, null)
        }
        if (authClient.createScopedRequired && authClient.createScopedRequired()) {
            var scopes = ['https://www.googleapis.com/auth/cloud-platform'];
            authClient = authClient.createScoped(scopes);
        }
        callback(null,authClient);
    })
}

export async function predict(resource: string[], callback) {
    authorize(function (err, authClient) {
        if (err) {
            callback(err,null);
            return;
        }
        let request = {
            // The project associated with the model.
            project: 'speech-api-151122',  // TODO: Update placeholder value.
            // The unique name for the predictive model.
            // id: 'sentiment-analysis-demo',  // TODO: Update placeholder value.
            id: 'sentiment-analysis',  // TODO: Update placeholder value.
            auth: authClient,
            resource: {
                input: {
                    csvInstance: resource
                }
            }
        };
        prediction.trainedmodels.predict(request, function (err, response) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, response);
        });
    });
}
