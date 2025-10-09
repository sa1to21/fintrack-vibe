{recentTransactions.length > 0 ? (
            <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-0">
                {recentTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    className={`p-4 hover:bg-blue-50/50 transition-colors duration-200 cursor-pointer ${
                      index !== recentTransactions.length - 1 ? 'border-b border-blue-100' : ''
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.55 + index * 0.05 }}
                    whileHover={{ x: 4 }}
                    onClick={() => onTransactionClick(transaction)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                            transaction.type === 'transfer'
                              ? 'bg-gradient-to-br from-purple-100 to-purple-200'
                              : transaction.type === 'income' 
                              ? 'bg-gradient-to-br from-emerald-100 to-emerald-200' 
                              : 'bg-gradient-to-br from-red-100 to-red-200'
                          }`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          {transaction.type === 'transfer' ? (
                            <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                          ) : transaction.type === 'income' ? (
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          )}
                        </motion.div>
                        <div>
                          <h3 className="font-medium text-sm">{transaction.categoryName}</h3>
                          <p className="text-xs text-muted-foreground">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString('ru-RU')} в {transaction.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <motion.p 
                          className={`font-medium ${
                            transaction.type === 'transfer' 
                              ? 'text-purple-600' 
                              : transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                          }`}
                          key={showBalance ? transaction.amount : 'hidden'}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {transaction.type === 'transfer' 
                            ? '' 
                            : transaction.type === 'income' ? '+' : '-'}
                          {showBalance ? formatCurrency(transaction.amount) : "• • •"}
                        </motion.p>
                        <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                          {transaction.type === 'transfer' && transaction.toAccountId
                            ? `${accounts.find(acc => acc.id === transaction.accountId)?.name || '?'} → ${accounts.find(acc => acc.id === transaction.toAccountId)?.name || '?'}`
                            : accounts.find(acc => acc.id === transaction.accountId)?.name || 'Неизвестно'}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div className="p-4 border-t border-blue-100">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      onClick={onViewAllTransactions}
                      variant="outline" 
                      className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300"
                    >
                      Показать все операции
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
              <CardContent className="p-4">
                <motion.div 
                  className="text-center py-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.div 
                    className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-3 shadow-sm"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Wallet className="w-6 h-6 text-blue-600" />
                  </motion.div>
                  <p className="text-muted-foreground text-sm mb-3">
                    Операций пока нет
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={onAddTransaction}
                      variant="outline" 
                      size="sm"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300"
                    >
                      Добавить первую операцию
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>