1. redis的配置文件详解
    `daemonize yes`，默认为yes,改设置用于控制redis是否
2. redis常用命令,只记录常用命令。不常用的需要时再去查API
    1. string和key的常用命令
    `./redis-server ../redis.conf` 使用指定的配置文件启动redis，此时redis会在后台启动
    `./redis-cli` 进入redis的控制台界面
    `redis-cli shutdown` 关闭
    `select 0` 切换数据库，redis默认有16个库，下标为 0-15
    `flushall` 清空所有库
    `flushdb` 清空当前库
    `expire key 秒钟` 为给定的key设置过期时间
    `ttl key` 查看key还有多少秒过期，-1为永不过期，-2为已经过期
    2. list的常用操作
    push插入数据，l在头部插入，r尾部插入。
    pop是弹出数据，l从头部开始弹，r从尾部开始弹
    `range key start stop` ，获取元素，只支持lrange从前到后的按范围取出数据。0 -1 表示取所有
    `lindex key index` 按下标获取数据，一样从前到后。
    `lset key index value` 按下标设置指定key中的值为value
    `llen key` 获取指定list的长度，
    `lrem key count value` 删除指定key中的指定个value，合计删除count个，因为list中的value是可以重复的。
    `ltrim key start stop` 将key指定范围的value截取出来重新赋值给key，就是一个list的截取操作
    `lpoplpush key1 key2` 将key1的最后一个元素弹出并加添到key2的头部，并返回这个元素。
    `linsert key before/after pivot value` 在指定key中的第pivot个位置插入value，不是下标，就是位置，从1开始数的。before/after决定从头开始数还是从后面开始数。
    注意，当list中的数据全部移除时，key也会被删除。因为是链表，所以也会存在收尾操作快中间操作慢的情况。我开始以为所有操作中的L是left，r是right。现在看来l表示list，r表示reversal。
    3. set常用操作
    `sadd key value1 value1 ...` 添加元素
    `smembers key` 获取set中的全部元素
    `sismember key value` 检查key对应的set中是否存在该元素
    `scard key` 获取set中的元素个数
    `srandmember key num` 从set中随机获取num个元素
    `spop key` 随机出栈，注意这里是随机的，不是从头尾取数
    `smove set1 set2 member` 将set1中的member移动到set2中
    `sdiff set1 set2` 差集
    `sinter set1 set2` 交集 
    `sunion set1 set2` 并集
    4. hash常用操作，hash结构中的value部分也是map结构，我习惯将它理解为一个对象。
    `hset key field value` 将key中的field属性的值赋值为value，如果属性不存在就是添加该属性并赋值
    `hget key field` 获取key中field属性的值
    `hmset key field1 value1 field2 value2...` 同时给多个属性赋值
    `hgetall key` 获取所有的键值对(属性和属性值)
    `hdel key field` 删除key中的某个属性
    `hlen key` 获取key的属性个数
    `hexists key field` 检查key中是否存在field属性
    `hkeys key` 获取key中的全部属性名称
    `hvals key` 获取key中全部属性的属性值
    `hincrby key field increment` 将key中的field属性的值在原来的基础上增加increment，只有当field的值为整数时有效
    `hincrbyfloat key field increment` 和hincrby一样，只是它只能操作值为浮点数的情况
    `hsetnx key field value` 当key中没有field字段时才执行添加该字段，否则不执行操作
    5. zset，有序set，元素按分数值排序.游戏排行榜，热搜榜等很适合这种数据结构
    `zadd key score1 member1 [score2 member2 ...]` 向集合中添加元素，每个元素都需要设置一个对应的分数，添加进去的元素按分数大小升序排列
    `zrange key start stop` 返回索引区间内的成员，注意是索引，不是分数。 `0 -1` 是返回全部,在后面添加参数withscores可以在获取元素的同时获取到元素对应的分数，支持limit
    `zrangebyscore key min max` 返回分数区间类内的元素，和zrange一样，支持withscores参数，支持limit
    `zrem key member1 [member2...]` 删除一个或多个元素
    `zcard key` 获取set中的元素个数
    `zcount key min max` 获取分数区间内的元素个数
    `zrank key member` 获取set中指定元素的下标，从0开始的
    `zrevrank key member` 获取指定成员的排名，顺序是从大到小。因为是排名，该名次也是从0开始的
    `zrevrange key start stop` 从高到低按索引获取区间内的元素，支持withscores
    `zrevrangebyscore key max min` 从高到低按分数获取区间内的元素，支持withscores.注意分数是先写大的，再写小的
    注意：使用 `0 -1`返回数据时表示返回全数据，此时不支持limit，而且`limit m n`语法表示从m条数据开始，往后获取n条数据。条数下标是从0开算的.只有zrange和zrangebyscore这两个操作支持limit，反转的命令(zrevrank)是没有limit的
3. 命令细节
    1. redis中value是没有类型的，默认都是string类型，但是它是一个非常特殊的string类型。你可以用string类型来保持对象或者文件的二进制。同时，如果string保存的是一个整数，在执行完`incrby key increment`后它还是一个整数。但是如果要增加的是小数，需要使用`incrbyfloat key increment`,此时values会变为一个小数，不能再使用`incrby`或者`incr`来增加值。而在减法运算中，redis只提供了整数的减法命令`decr`和`decrby`,没有提供小数的减法操作。小数貌似都有精度问题。
    2. `config get requirepass` 获取redis密码,`config set requirepass 123456` 设置密码。redis默认是没有密码的，建议不用密码。
4. redis的持久化,分为RDB和AOF两种.
RDB:是默认开启的，redis会在特定时间或者满足特定条件时将内存数据写入到磁盘中(默认文件名dump.rdb),执行`save`命令时必定会执行一次持久化操作。这种方式在数据恢复时速度最快，但是发生意外时会丢失最后一次的快照后的数据。同时，RDB模式下每次快照时会fork一份当前的进程信息，这样主进程可以在无阻塞的情况下由fork进程来完成持久化操作。弊端是快照发生时需要消耗两倍的内存空间。空间不足时redis提示`MISCONF Redis is configured to save RDB snapshots`异常。可以通过`config set stop-writes-on-bgsave-error no`隐藏错误，但是此时的redis虽然不在报错，同样也无法在提供持久化服务。适用场景：对于恢复数据量特别大，同时对数据完整性和一致性要求不高，允许一小撮丢失的场景！
AOF:默认关闭，通过`appendonly yes`开启。这种模式下redis会将自己执行过的每一条操作都以日志追加的方式记录到appendonly.aof中。这种方式的数据完整性就好，但是性能较差。这种模式下的日志同步方式(appendfsync)有三种：1.always,同步持久化，每次数据发生变化都进行记录，数据完整性最好但是性能差；2.everysec，(完整词汇every second)它是异步操作，每秒记录一次。如果宕级会有1秒的数据丢失，推荐该策略；3. no，不同步，这种模式下redis性能和rdb是一样的，但是这样就没有意义了，不推荐。
因为以日志的形式记录所有操作命令，日志文件会非常大。redis提供了命令`BGREWRITEAOF`会异步执行appendonly.aof文件重写操作，对aof文件进行压缩，保留可恢复数据的最小指令集。比如100次++，合并为一次+100的操作。默认情况下aof文件大于64M时会触发一次重写，以后文件每扩大一倍就会自动触发一次。
redis允许同时开启两种模式，作者也建议这么做。两者都有时redis的数据恢复以aof为准。
5. redis事务
redis事务的本质是一组命令的集合，集合中的命令会按顺序串行化执行。但是它具备原子性、隔离级别和回滚的概念。
当集合中的任何一条命令存在可检测的命令性错误时(类似java的编译期异常,比如输入了不存在的命令)，集合中的所有命令都不会买被执行。
当集合中的任何一条命令存在语法错误时(类似java中的运行时异常，比如对不能转换为int字符串进行加减操作)，事务会放弃执行该命令，但是其他命令依然会正常执行。
redis通过`multi`开启事务，在此之后的所有命令都会被记录到命令队列中，当`exec`命令触发时才会真正开始执行命令。`discard`命令用来放弃事务。
redis事务还有一个非常重要的命令`watch key1 [key2]`,该命令用于监视某个key的改变，在事务执行前如果key被其他命令修改过，则事务不会被执行。通过`unwatch`可以放弃监视。因为redis中没有数据库中的“行级锁”，而cpu又是交替执行的，当我们以一组事务去操作某个key时很难保证中间不会有其他的人去变更key的值。所以redis引入了`watch`(check and set),通过监视指定值的改变（同cas的版本号机制）,如果没有变化就执行事务，否则放弃事务。
6. redis也具备消息中间件的订阅/发布功能，但是很少有人在生产中使用，大家貌似习惯系统专业的消息中间件，不知道为什么。反正我用过一次，没发现什么问题。
7. redis的主从复制和哨兵模式
默认情况下redis启动就是master，只有执行命令`saveof ip port`或者 在配置中设置 `saveof ip port`,此时的redis将自动变为slave。配置完成后的主库复制写，从库则不能在执行任何写操作。如果是在一台机器上启动多个redis，记得修改pid、log和dump.rdb的名字。
在实际使用中我们一般会使用哨兵模式来配置redis，因为传统的主从复制在master死掉后，所有的slave都会原地待命。而哨兵模式会自动发起选举来确定新的master。当原来的master重启回来后，自己属于是脱离了集群的一个独立的分支，集群中不其他slave不会再认它为主。还有一点，主从模式和哨兵模式下，只要redis重新接入master就会做一次全量数据复制，后面的都是增量复制。
哨兵模式的配置也很简单，只需要在redis配置目录下添加一个叫`sentinel.conf`文件就可以了，名字不能修改。然后在配置文件中写入`sentinel monitor 被监控redis的名字(自己取名字) 被监控的IP 端口 票数`  
8. 配置文件说明,一般使用默认配置就可以了，默认配置不能满足使用时再去修改：
> redis.conf 配置项说明如下：
    1. Redis默认不是以守护进程的方式运行，可以通过该配置项修改，使用yes启用守护进程
    daemonize no
    2. 当Redis以守护进程方式运行时，Redis默认会把pid写入/var/run/redis.pid文件，可以通过pidfile指定
    pidfile /var/run/redis.pid
    3. 指定Redis监听端口，默认端口为6379，作者在自己的一篇博文中解释了为什么选用6379作为默认端口，因为6379在手机按键上MERZ对应的号码，而MERZ取自意大利歌女Alessia Merz的名字
    port 6379
    4. 绑定的主机地址
    bind 127.0.0.1
    5.当 客户端闲置多长时间后关闭连接，如果指定为0，表示关闭该功能
    timeout 300
    6. 指定日志记录级别，Redis总共支持四个级别：debug、verbose、notice、warning，默认为verbose
    loglevel verbose
    7. 日志记录方式，默认为标准输出，如果配置Redis为守护进程方式运行，而这里又配置为日志记录方式为标准输出，则日志将会发送给/dev/null
    logfile stdout
    8. 设置数据库的数量，默认数据库为0，可以使用SELECT <dbid>命令在连接上指定数据库id
    databases 16
    9. 指定在多长时间内，有多少次更新操作，就将数据同步到数据文件，可以多个条件配合
    save <seconds> <changes>
    Redis默认配置文件中提供了三个条件：
    save 900 1
    save 300 10
    save 60 10000
    分别表示900秒（15分钟）内有1个更改，300秒（5分钟）内有10个更改以及60秒内有10000个更改。
    10. 指定存储至本地数据库时是否压缩数据，默认为yes，Redis采用LZF压缩，如果为了节省CPU时间，可以关闭该选项，但会导致数据库文件变的巨大
    rdbcompression yes
    11. 指定本地数据库文件名，默认值为dump.rdb
    dbfilename dump.rdb
    12. 指定本地数据库存放目录
    dir ./
    13. 设置当本机为slav服务时，设置master服务的IP地址及端口，在Redis启动时，它会自动从master进行数据同步
    slaveof <masterip> <masterport>
    14. 当master服务设置了密码保护时，slav服务连接master的密码
    masterauth <master-password>
    15. 设置Redis连接密码，如果配置了连接密码，客户端在连接Redis时需要通过AUTH <password>命令提供密码，默认关闭
    requirepass foobared
    16. 设置同一时间最大客户端连接数，默认无限制，Redis可以同时打开的客户端连接数为Redis进程可以打开的最大文件描述符数，如果设置 maxclients 0，表示不作限制。当客户端连接数到达限制时，Redis会关闭新的连接并向客户端返回max number of clients reached错误信息
    maxclients 128
    17. 指定Redis最大内存限制，Redis在启动时会把数据加载到内存中，达到最大内存后，Redis会先尝试清除已到期或即将到期的Key，当此方法处理 后，仍然到达最大内存设置，将无法再进行写入操作，但仍然可以进行读取操作。Redis新的vm机制，会把Key存放内存，Value会存放在swap区
    maxmemory <bytes>
    18. 指定是否在每次更新操作后进行日志记录，Redis在默认情况下是异步的把数据写入磁盘，如果不开启，可能会在断电时导致一段时间内的数据丢失。因为 redis本身同步数据文件是按上面save条件来同步的，所以有的数据会在一段时间内只存在于内存中。默认为no
    appendonly no
    19. 指定更新日志文件名，默认为appendonly.aof
    appendfilename appendonly.aof
    20. 指定更新日志条件，共有3个可选值： 
    no：表示等操作系统进行数据缓存同步到磁盘（快） 
    always：表示每次更新操作后手动调用fsync()将数据写到磁盘（慢，安全） 
    everysec：表示每秒同步一次（折衷，默认值）
    appendfsync everysec
    21. 指定是否启用虚拟内存机制，默认值为no，简单的介绍一下，VM机制将数据分页存放，由Redis将访问量较少的页即冷数据swap到磁盘上，访问多的页面由磁盘自动换出到内存中（在后面的文章我会仔细分析Redis的VM机制）
    vm-enabled no
    22. 虚拟内存文件路径，默认值为/tmp/redis.swap，不可多个Redis实例共享
    vm-swap-file /tmp/redis.swap
    23. 将所有大于vm-max-memory的数据存入虚拟内存,无论vm-max-memory设置多小,所有索引数据都是内存存储的(Redis的索引数据 就是keys),也就是说,当vm-max-memory设置为0的时候,其实是所有value都存在于磁盘。默认值为0
    vm-max-memory 0
    24. Redis swap文件分成了很多的page，一个对象可以保存在多个page上面，但一个page上不能被多个对象共享，vm-page-size是要根据存储的 数据大小来设定的，作者建议如果存储很多小对象，page大小最好设置为32或者64bytes；如果存储很大大对象，则可以使用更大的page，如果不 确定，就使用默认值
    vm-page-size 32
    25. 设置swap文件中的page数量，由于页表（一种表示页面空闲或使用的bitmap）是在放在内存中的，，在磁盘上每8个pages将消耗1byte的内存。
    vm-pages 134217728
    26. 设置访问swap文件的线程数,最好不要超过机器的核数,如果设置为0,那么所有对swap文件的操作都是串行的，可能会造成比较长时间的延迟。默认值为4
    vm-max-threads 4
    27. 设置在向客户端应答时，是否把较小的包合并为一个包发送，默认为开启
    glueoutputbuf yes
    28. 指定在超过一定的数量或者最大的元素超过某一临界值时，采用一种特殊的哈希算法
    hash-max-zipmap-entries 64
    hash-max-zipmap-value 512
    29. 指定是否激活重置哈希，默认为开启（后面在介绍Redis的哈希算法时具体介绍）
    activerehashing yes
    30. 指定包含其它的配置文件，可以在同一主机上多个Redis实例之间使用同一份配置文件，而同时各个实例又拥有自己的特定配置文件
    include /path/to/local.conf
##### 2020-07-22 补充
今天面试时面试官问了两个关于redis的问题，没答上来，这里记录下：
1.redis的分布式锁是如何实现的？
通过setnx实现，该命令设置值时只在key不存在时生效，若key已经存在就不会再执行任何动作。redis本身是单线程的，所有命令都是串行，通过反复set和remove就能实现分布式锁。
springboot提供了RedisTemplate对象来操作数据库，但是在分布式场景下使用redission更加合适。示例代码如下：
```java
  @Autowired
	private Redisson redisson;
	@Autowired
	private StringRedisTemplate stringRedisTemplate;
	//使用RedisTemplate实现分布式锁
	public void test4(){
		String lockKey = "product_001";
		String clientId = UUID.randomUUID().toString();
		try {
			stringRedisTemplate.opsForValue().setIfAbsent(lockKey,clientId);
			stringRedisTemplate.expire(lockKey,10,TimeUnit.SECONDS);
			System.out.println( "创建一个子线程，在子线程中创建一个定时器，循环给上面的key续命，避免主线程还没走到finally中key就失效的情况" );
			System.out.println("执行业务逻辑");
		}finally {
			//检查锁是不是自己加的，如果是就开锁。避免并发下把别人添加的锁给删除了
			if ( clientId.equals( stringRedisTemplate.opsForValue().get(lockKey) ) ){
				stringRedisTemplate.delete(lockKey);
			}
		}
	}
	//使用redisson实现分布式锁，原理是一样的，但是代码更加简洁
	@Test
	public void test2(){
		String lockKey = "product_001";
		//获取到一个锁对象
		RLock redissonLock = redisson.getLock(lockKey);
		try {
			//设置锁到redis中，key失效时间为10秒，同时会在失效时间1/3的时候重置失效时间，避免业务没走完锁就没了
			redissonLock.lock(10,TimeUnit.SECONDS);
			System.out.println("执行业务逻辑");
		}finally {
			redissonLock.unlock();
		}
	}
```
注意：redis是单线程的，足够应付大多数场景。如果要在这个基础上进一步提升并发，可以将数据分段加载到redis，不同实例访问不同的数据段，这样就能进一步提升性能，原理和ConcurrentHashMap中的分段锁差不多。
在集群环境下，当主节点设置锁后宕级，该锁如果还没同步到从节点会导致锁失效，redis本身无法解决这个问题，可以考虑使用zookeeper实现分布式锁，但是速度会慢些。
2.redis应该如何防止缓存击穿，如果查询的结果redis中没有，数据库中也没有，那么每次查询时必然都会走数据库，如何防范？
答：对于热点数据做缓存。对于数据库中都不存在的数据，可以在redis中放一个value为null的键值对。这样查询时redis就能命中了，可以将这种键值对的失效时间设置短一点，这样redis也不至于无线放大。