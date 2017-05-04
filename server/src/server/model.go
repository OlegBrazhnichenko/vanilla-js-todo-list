package main

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"fmt"
	"errors"
)

const (
	DB_NAME = "tasks"
)

func createAndOpenDB(name string) *sql.DB{
	db, err := sql.Open("mysql", "root:123@tcp(127.0.0.1:3306)/")
	checkErr(err)

	_,err = db.Exec("CREATE DATABASE IF NOT EXISTS "+name)
	checkErr(err)
	_,err = db.Exec("ALTER DATABASE tasks CHARACTER SET utf8 COLLATE utf8_unicode_ci;")
	checkErr(err)

	_,err = db.Exec("USE "+name)
	checkErr(err)
	_,err = db.Exec("CREATE TABLE IF NOT EXISTS tasks (  id int NOT NULL AUTO_INCREMENT, task varchar(255), checkComplete VARCHAR(32),PRIMARY KEY (id))")
	checkErr(err)

	return db
}


func create(data task)[]task{
	db := createAndOpenDB(DB_NAME)
	defer db.Close()
	stmt, err := db.Prepare("INSERT tasks SET task=?, checkComplete=?")
	checkErr(err)

	res, err :=stmt.Exec(data.Task, data.CheckComplete)
	lastId, _ := res.LastInsertId()

	var result []task
	result = append(result,getById(lastId))

	return result
}

func getById(id int64)task{
	db := createAndOpenDB(DB_NAME)
	defer db.Close()
	row := db.QueryRow("SELECT * FROM tasks WHERE id =?",id)

	var task task
	err := row.Scan(&task.Id, &task.Task, &task.CheckComplete)
	checkErr(err)

	return task
}

func deleteTask(data task) error{
	db := createAndOpenDB(DB_NAME)
	defer db.Close()

	stmt, err := db.Prepare("delete from tasks where id=?")
	checkErr(err)
	res, err :=stmt.Exec(data.Id)

	affect, err := res.RowsAffected()
	checkErr(err)

	if affect <= 1 {
		return errors.New("removal failed")
	}

	return	nil
}

func getAll() []task{
	db := createAndOpenDB(DB_NAME)
	defer db.Close()
	rows, err := db.Query("SELECT * FROM tasks")
	checkErr(err)
	var result []task
	for rows.Next() {
		var task task
		err = rows.Scan(&task.Id, &task.Task, &task.CheckComplete)
		checkErr(err)
		result = append(result,task)
	}

	return result
}

func update(data task){
	db := createAndOpenDB(DB_NAME)
	defer db.Close()

	stmt, err := db.Prepare("update tasks set task=?, checkComplete=? where id=?")
	checkErr(err)
	stmt.Exec(data.Task, data.CheckComplete, data.Id)
}


func checkErr(err error){
	if err != nil {
		panic(err)
	}
}

func deleteDB(){
	db := createAndOpenDB(DB_NAME)
	defer db.Close()
	stmt, err := db.Prepare("DROP DATABASE tasks")
	checkErr(err)
	smth, err := stmt.Exec()
	checkErr(err)
	fmt.Println(smth)

	return
}