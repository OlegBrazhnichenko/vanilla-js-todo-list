package main

import (
	"github.com/gorilla/mux"
	"net/http"
	"log"
	"encoding/json"
	"fmt"
)

type requestData struct {
	Action string
	Id int
	Task string
	CheckComplete string
}

type task struct {
	Id int
	Task string
	CheckComplete string
}

func MakeRouter()  {

	router := mux.NewRouter()
	staticRoutes := []string{"css","js","images"}
	initializeStaticRoutes(router, staticRoutes)

	router.HandleFunc("/", MainPageHandler).Methods("GET")
	router.HandleFunc("/post", postHandler).Methods("POST")

	http.Handle("/", router)
}

func initializeStaticRoutes( router *mux.Router ,staticRoutes []string){
	for i := 0; i < len(staticRoutes); i++{
		router.PathPrefix("/"+staticRoutes[i]+"/").Handler(
			http.StripPrefix("/"+staticRoutes[i]+"/", http.FileServer(http.Dir("./app/"+staticRoutes[i]+"/"))))
	}
}

func MainPageHandler(w http.ResponseWriter, r *http.Request){
	http.ServeFile(w, r,"app/index.html")
}

func postHandler(w http.ResponseWriter, r *http.Request){
	dec := json.NewDecoder(r.Body)

	var data requestData
	err := dec.Decode(&data)

	if err != nil {
		log.Fatal(err)
	}

	action := data.Action

	var task task
	task.Id = data.Id
	task.Task = data.Task
	task.CheckComplete = data.CheckComplete

	switch action {
	case "create":
		result := create(task)
		fmt.Println("res ",result[0].Task)
		response, _ := json.Marshal(result)
		w.Write(response)
	case "getAll":
		tasks := getAll()
		response, _ := json.Marshal(tasks)
		w.Write(response)
	case "update":
		update(task)
		response, _ := json.Marshal("success")
		w.Write(response)
	case "delete":
		err := deleteTask(task)
		response, _ := json.Marshal("success")
		if err != nil {
			response, _ = json.Marshal(err)
		}
		w.Write(response)
	}

}