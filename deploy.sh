docker build -t kishorenewton/multi-client:latest -t kishorenewton/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t kishorenewton/multi-server:latest -t kishorenewton/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t kishorenewton/multi-worker:latest -t kishorenewton/multi-worker:$SHA -f ./worker/Dockerfile ./worker

docker push kishorenewton/multi-client:latest
docker push kishorenewton/multi-server:latest
docker push kishorenewton/multi-worker:latest

docker push kishorenewton/multi-client:$SHA
docker push kishorenewton/multi-server:$SHA
docker push kishorenewton/multi-worker:$SHA

kubectl apply -f k8s
kubectl set image deployments/server-deployment server=kishorenewton/multi-server:$SHA
kubectl set image deployments/client-deployment client=kishorenewton/multi-client:$SHA
kubectl set image deployments/worker-deployment worker=kishorenewton/multi-worker:$SHA