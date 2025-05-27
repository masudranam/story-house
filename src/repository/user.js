//user table
const User = db.define('user',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull:false
    },
    userName:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull:false
    },
    joinDate:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    role:{
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    passLastModificationTime:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
},{
    freezeTableName: true,
    tableName: 'user'
})

await User.sync( );