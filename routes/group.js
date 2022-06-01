const express = require("express");
const req = require("express/lib/request");
const router = express.Router();

var groups = [
  {
    name: "relax and splitkaro",
    members: ["Ram", "Shyam"],
  },
];

var expenses = [];
/*
  default expenses obj = 
  {
    "name": "relax and splitkaro",
    "items": [
      {
        "name": "milk",
        "value": 50,
        "paid_by": [{ "Ram": 40, "Shyam": 10 }],
        "owed_by": [{ "Ram": 20, "Shyam": 20, "Rocky": 10 }]
      },
      {
        "name": "fruits",
        "value": 50,
        "paid_by": [{ "Ram": 50 }],
        "owed_by": [{ "Ram": 10, "Shyam": 30, "Rocky": 10 }]
      }
    ]
  }
*/
const balances = [];

//GET ALL GROUPS AND ITS MEMBERS
router.get("/groups", (req, res) => {
  //FUNCTIONS
  function getGroups() {
    return groups;
  }

  //PROCESSING Starts
  var Groups = getGroups();
  res.json({ Groups });
});

//CREATE A GROUP BY SENDING GROUP NAME AND MEMBERS
router.post("/groups", (req, res) => {
  //FUNCTIONS
  function validateSchema(expenses) {
    return true; //We can update later on the basis of final schema, not necessary for testing.
  }

  function saveGroup(group) {
    groups.push(group);
  }

  //PROCESSING Starts
  const isCorrectSchema = validateSchema(req.body);
  if (!isCorrectSchema) {
    res.json("Incorrect Schema");
    return;
  }

  saveGroup(req.body);
  res.json({ groups }); //sending updated groups data
  console.log(req.body);
});

router.get("/expense", (req, res) => {
  //FUNCTIONS
  function getExpenses() {
    return expenses;
  }

  //PROCESSING Starts
  var Expenses = getExpenses();
  res.json({ Expenses });
});

//CREATE EXPENSE WITH GROUP MEMBERS
router.post("/expense", (req, res) => {
  //FUNCTIONS
  //Validating Request
  function validateSchema(expenses) {
    return true;
  }

  //Function to check and add a member who is not in group
  function checkAllMembers(items) {
    items.map((item) => {
      //iterating every object of items to get the people who have to pay or take money, i.e., get every people of that item/event
      function ifMemberPresent(members) {
        members.map((member) => {
          if (
            group &&
            group.members &&
            !group.members.find((oldMember) => oldMember === member)
          )
            //Adding a new member to group
            groups[groupId].members.push(member);
          return;
        });
      }
      members = Object.keys(item.paid_by[0]); //as paid_by array will have only one object, that's why taking the first object of array
      ifMemberPresent(members); //can be empty array
      members = Object.keys(item.owed_by[0]); //taking first element, because that's only element in owed_by array.
      ifMemberPresent(members);
      return;
    });
  }

  //Checking if the group is present in the Database
  function findByName(groups) {
    return groups.name === req.body.name;
  }

  //PROCESSING Starts
  const isCorrectSchema = validateSchema(req.body);
  if (!isCorrectSchema) {
    res.json("Incorrect Schema");
    return;
  }

  var groupId = groups.findIndex(findByName);
  if (groupId === undefined) {
    res.json("Group Not found, Please check name OR create new one!!");
    return;
  }
  var group = groups[groupId];

  //Checking if all members are present in the group created previously, adding them if not.
  checkAllMembers(req.body.items);

  expenses.push(req.body);

  res.json({ expenses });
  return;
});

//UPDATING AN EXPENSE
router.patch("/expense", (req, res) => {
  function validateSchema(expenses) {
    return true;
  }
 /*
  we can update anything in expense by passing an array, which consists of nested objects to update
  we will need an ID of the expense we want to update.(Using Index of object in main array as of now)
  for example here if we want to update paid_by in the array of items where name is fruits, we've to send from client: 
   {
     "expenseId":0,
     "itemsId":1,
     "paid_by":[{"A": 40, "B": 10}]
   } //[refer default aobject on line:14]
     
  --> One another method to update this is, already send an updated obj from client side of that expense event instead of updated value
  */
  const isCorrectSchema = validateSchema(req.body);
  if (!isCorrectSchema) {
    res.json("Incorrect Schema");
    return;
  }
  const 
    expenseId = req.body.expenseId,
    itemsId = req.body.itemsId,
    updated_value = req.body.updated_value; 

  if (
    expenses[expenseId] &&
    expenses[expenseId].items[itemsId] &&
    expenses[expenseId].items[itemsId].paid_by
  )
    expenses[expenseId].items[itemsId].paid_by = updated_value;

  res.json({ expenses });
  return;
});

//DELETING AN EXPENSE WITH EXPENSEID == EXPENSE_NAME
router.delete("/expense", (req, res) => {
  //FUNCTIONS
  function validateSchema(expenses) {
    return true;
  }

  function findByExpenseName(expenses) {
    return expenses.name === req.body.name;
  }

  function getExpense(){
    return expenses;
  }

  function getExpenseId (expenses){
    var expenseId = expenses.findIndex(findByExpenseName);
    return expenseId;
  }

  function saveExpenses(){
    expenses = Expenses;
  }

  //PROCESSING Starts
  const isCorrectSchema = validateSchema(req.body);
  if (!isCorrectSchema) {
    res.json("Incorrect Schema");
    return;
  }
  const Expenses =  getExpense();
  const expenseId = getExpenseId(Expenses); 
  if (expenseId<0) {
    res.json("Expense Not found, Please check name OR create new one!!");
    return;
  }

  Expenses.splice(expenseId, 1); //deleting requested expense
  saveExpenses();//saving updated expenses array
  res.send("Deleted Successfully");
  return;
});

router.get("/balance", (req, res) => {
  //FUNCTIONS
  function getBalance() {
    return balances;
  }
  //PROCESSING Starts
  const Balances = getBalance();
  res.json({ Balances });
  return;
});

/*
  suppose a matrix is given: who owes who's money
  for example: 
  1. If A,B,C are in a group such that A owes B Rs 100, B owes C Rs 100, the balance summary should show that A owes C Rs 100, matrix will look like
     A B   C
   A 0 100 0
   B 0 0   100
   C 0 0   0

  2. If A owes B 10 rs, A owes C 20 rs, B owes A 10 rs, B owes C 40 rs, C owes A 40 rs, C owes B 80 rs, matrix will look like
     A  B  C
   A 0 10 20
   B 10 0 40
   C 40 80 0
*/

//USING ABOVE DATA (format) FOR FURTHER PROCESSING
router.post("/balance", (req, res) => {
  //FUNCTIONS
  function validateSchema(expenses) {
    return true;
  }

  function getMatrix() {
    var matrix = new Array();
    matrix.push([0, 10, 20]);
    matrix.push([10, 0, 40]);
    matrix.push([40, 80, 0]);

    /*
    Another matrix
      matrix.push([0, 100, 0]);
      matrix.push([0, 0, 100]);
      matrix.push([0, 0, 0]);
    */
    return matrix;
  }

  function getMembers() {
    var members = ["A", "B", "C"];
    return members;
  }

  function getBalanceObj() {
    const object = {
      total_balance: total_balance,
      owes_to: [],
      owes_by: [],
    }; 
    return object;
  }

  function isEmptyObj(object){
    return !Object.keys(object).length;
  }

  function setBalanceObj(balance, owesTo, owesBy, member){
    if (balance > 0) owesTo[member] = balance;
    else if (balance < 0) owesBy[member] = -balance;
  }

  //PROCESSING Starts
  const isCorrectSchema = validateSchema(req.body);
  if (!isCorrectSchema) {
    res.json("Incorrect Schema");
    return;
  }

  var dues = getMatrix();
  var members = getMembers();
  var totalMembers = dues.length;
  var memberBalance = new Array(); //storing the balance of every member
  /*
  Algorithm: the logic for simplifying and minimising the no. of transactions is: every person will give their dues to a person [mature person], he'll distribute this money to other members 
  mature person: is a person who, when all the payments are simplified, has to do atleast a transaction, i.e., (total outgoing amount) - (total incoming amount) != 0
  for example B owes A 10 rs, A owes C 10 rs, everyone except A is a mature person.
  [refer examples for better understanding].
  */
  var centreMember = -1; //mature member

  for (var i = 0; i < totalMembers; i++) {
    var balance = 0;
    for (var j = 0; j < totalMembers; j++) {
      balance -= dues[i][j];
    }
    for (var j = 0; j < totalMembers; j++) {
      balance += dues[j][i];
    }
    if (centreMember < 0 && balance != 0) {
      centreMember = i;
    }
    memberBalance.push(balance); //( = -outgoing +incoming) balance is stored [can be negative]
  }

  var simplifiedBalance = {}; //final balance

  for (var i = 0; i < totalMembers; i++) {
    var member = members[centreMember],
      owesTo = {},
      owesBy = {},
      total_balance = memberBalance[i],
      obj = getBalanceObj();
    
    if (i == centreMember) {
      for (var j = 0; j < totalMembers; j++) {
        if (i == j) continue;
        setBalanceObj(memberBalance[j], owesTo, owesBy, members[j]); 
      }  
    } 
    else {
      setBalanceObj(total_balance, owesTo, owesBy, member); 
    }

    if (!isEmptyObj(owesBy))
      obj.owes_by.push(owesBy); 
    if (!isEmptyObj(owesTo))
      obj.owes_to.push(owesTo);
      
    simplifiedBalance[members[i]] = obj; 
  }
  res.json({ simplifiedBalance });
  return;
});

module.exports = router;