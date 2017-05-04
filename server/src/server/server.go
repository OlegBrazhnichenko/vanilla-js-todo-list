package main

import (
	"net/http"
)

func main() {
	startServer()
}

func startServer(){
	MakeRouter()
	//deleteDB()
	http.ListenAndServe(":9090", nil)
}

//var checkboxes = document.getElementsByTagName('label');
// for (var i = 0; i < checkboxes.length; i++){
//     checkboxes[i].addEventListener("click",function(){
//         console.log("event");
//     })
// }