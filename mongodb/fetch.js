const { connectToDb, getDb } = require('./db')

connectToDb((err) => {
    if(!err){
        app.listen(3000, () => {
            console.log('app listening on port 3000')
        })
        db = getDb() //Returns database object
    }
})
