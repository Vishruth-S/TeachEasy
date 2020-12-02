const users = [];

const addUser = (user) => {
    users.push(user)
}
const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id)
    if (index !== -1)
        return users.splice(index, 1)[0]
}
const getUser = (id) => users.find(user => user.id === id)

const getUsers = () => { return [...users] }


module.exports = { addUser, removeUser, getUser, getUsers }