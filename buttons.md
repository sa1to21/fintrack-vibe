        {/* Quick Actions */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <h2 className="font-medium mb-3 text-foreground">Быстрые действия</h2>
          <div className="space-y-3">
            <motion.div
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={onAddTransaction}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 h-auto flex-col gap-2 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <Plus className="w-5 h-5 relative z-10" />
                <span className="text-sm relative z-10">Добавить операцию</span>
              </Button>
            </motion.div>
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  onClick={onTransfer}
                  variant="outline"
                  className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 p-4 h-auto flex-col gap-2 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                  <span className="text-sm">Перевод</span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  onClick={onManageAccounts}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 p-4 h-auto flex-col gap-2 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <Wallet className="w-5 h-5" />
                  <span className="text-sm">Счета</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>