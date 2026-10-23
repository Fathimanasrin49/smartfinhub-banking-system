import mysql from 'mysql2'

export const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'sql123',
    database:'smart_finhub'
})

export default db;