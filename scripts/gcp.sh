# make cloud run service with cloud sql connection
gcloud run deploy httpmon \
--image=gcr.io/httpmon-test/httpmon@sha256:72d47eeee68f3d3369f65aaad74e2b0e3c4ef1578e457691fc0c9a96c59aa203 \
--set-env-vars=DB_NAME=mondb,DB_HOST=/cloudsql/httpmon-test:us-east1:mondb-test,DB_PORT=5432,DB_USER=postgres,DB_PASSWORD=Y59j3NEAgDg \
--set-cloudsql-instances=httpmon-test:us-east1:mondb-test \
--platform=managed \
--region=us-east1 \
--project=httpmon-test \
 && gcloud run services update-traffic httpmon --to-latest


# create a topic to cosume region specific monitoring data
 gcloud eventarc triggers create trigger-1sgrbfjd \
--location=us-east1 \
--destination-run-service=httpmon \
--destination-run-region=us-east1 \
--destination-run-path=/api/services/monitor \
--service-account=439355076640-compute@developer.gserviceaccount.com \
--event-filters=type=google.cloud.pubsub.topic.v1.messagePublished \
--transport-topic=httpmon-test-monitor-us-east1



# create a topic to cosume region specific monitoring data
gcloud eventarc triggers create trigger-cgnr15no \
--location=europe-west3 \
--destination-run-service=httpmon-europe-west3 \
--destination-run-region=europe-west3 \
--destination-run-path=/api/services/monitor \
--service-account=439355076640-compute@developer.gserviceaccount.com \
--event-filters=type=google.cloud.pubsub.topic.v1.messagePublished \
--transport-topic=httpmon-test-monitor-europe-west3

