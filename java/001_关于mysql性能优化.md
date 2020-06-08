这貌似是一个可大可小，老生常谈的问题。这里记录下应该要注意的点。
当一条sql语句被执行时，mysql会先用“查询优化器”生成执行计划，然后在根据执行计划执行sql。查询优化器是mysql自己的行为，我们不能干涉，只能尽可能的配合它的规则来提高sql效率。
***【关于索引】*** 
索引是提高查询效率最直接有效的方法，需要注意的点如下：
1.索引不是越多越好，它可以提高查询效率，同时也会降低插入和修改的效率。一般单表索引不应该超过5个
2.创建联合索引时应该将使用频繁的字段和较小的字段放在前面
3.避免冗余索引和重复索引，这样会增加查询优化器生成执行计划的时间，比如这种：
重复索引示例：primary key(id)、index(id)、unique index(id)
冗余索引示例：index(a,b,c)、index(a,b)、index(a)
4.不建议使用外键约束。外键能保证数据参照的完整性，但是会降低父、子表的写入性能。这种约束应该通过代码逻辑实现。
5.避免隐式数据类型转换导致索引失效。比如这种：
    select name,phone from customer where id = '111';
6.避免使用前置`%`,前置百分号会是索引失效，但是后置百分号不会
7.一条sql只能使用一个索引列，应该合理利用索引列所在的位置

***【查询】***
1.不要使用 SELECT *,必须使用SELECT<字段>查询，指定字段可以减少Io和表结构变化带来的影响。
2.尽量将子查询改为join 查询，因为子查询的结果集是无法使用索引的。
3.join操作中mysql最多允许61张表关联，但是不建议超过5张，阿里规范是最多3张。
4.or操作一般不走索引；in操作会走索引，但是不要超过500个。
5.where 、order by 等条件操作中禁止使用函数转换，任何形式的函数转换和计算都会导致索引失效。

1. mysql的查询优化器是一个很神奇的东西。在执行sql语句前它会先对sql进行语法分析，比如：`select uid,name from user where gender = 1;`.它会先根据where语句对表行进行选取，而不是将全表查询出来再进行过滤。字段uid和name也是先进行属性投影，而不是将全部属性取出再进行过滤。而且mysql自身也维护了查询缓存，失效条件和mybatis差不多。
2. InnoDB是目前MySQL中唯一一种支持外键的内置存储引擎。只有建立了索引的列才能被选作为外键约束列。索引越多，修改越慢。而且在有外键约束的场景下，我们通常需要自己多执行一次查询来检查外键的存在。mysql外键约束目的是为了保证两表数据一致性，而任何会影响到外键一致性的sql都会执行失败。
阿里的开发手册中提出“不得使用外键与级联，一些外键概念必须在应用层解决”。我习惯在业务系统中使用主键ID作为关联字段，关联表不做外键约束，但是在代码层做逻辑检查。
级联关系可以在创建表时通过 添加`FOREIGN KEY (sid) REFERENCES stu(sid) ON DELETE CASCADE ON UPDATE CASCADE`来实现绑定，当主表记录被删除时，外键关联表的记录会被同步删除。但是这样的绑定关系是强阻塞的，存在数据库更新风暴的风险，小型项目可以这么玩，分布式项目不推荐，反正我没用过。
3. sql执行语法分析时大致可以分为6个步骤：
3.1 从from开始，准备定位表。如果from中的是关联查询语句，则将其中的内容执行查询生成虚表。
3.2 进入where，这是一个定位的过程，当条件为true时，数据行将被标记选取。
3.3 执行group by，同样执行逻辑判断，值一样的分为一组。
3.4 执行having筛选器
3.5 执行select 查询挑选器，这个环节会从数据行中获取指定字段值，distinct过滤操作也在这个环节发生
3.6 最后一步，执行 order by。重新规整数据并返回。
4. 索引不是万能的，有三种情况不适合建索引：
a.记录较少的表；
b.经常增删改的表;
c.数据重复性大且分布平均的表，这种情况适合使用数据分区来提升查询效率。因为索引的命中率是由：不同值列数/总列数，不同值越多，索引效率越高。如果有一半的条目都是重复值，此时的索引并不能提升效率。
5. explain 关键字详解，使用该关键字可以看到mysql的执行计划,进而知道sql的读取顺序、使用的索引等等。该执行计划共有11个字段，详细说明如下：
5.1 id :标记查询优先级，id数值越大，执行优先级越高。id数值相同的，在上面的先执行。
5.2 select_type :标记查询类型，一个复杂的sql会被优化器拆分为很多个小的sql单元来执行。select_type就是用来标记当前sql单元属于什么类型，比如：联合查询，子查询等等
5.3 table ：标记当前的执行单元的数据来源于哪张表
5.4 type ：重点，标记当前执行单元使用的那种查询方式。查询方式可以分为7种，查询速度依次递减。详细如下：
5.4.1 system:它属于系统表中的一种，可以认为它是系统内置的，我们平常使用不到，不做讨论
5.4.2 const：表示通过索引一次就能找到数据行，一般通过主键或者unique索引就属于这个类型,比如 select * from user where id = 1
5.4.3 eq_ref: 只有当使用的索引键为唯一索引或主键索引时才会是这个类型，例如:select * from user ,role where role.id = user.role_id;它和const很像，区别是const可以一次定位到数据行，eq_ref需要做一次关联扫描
5.4.4 ref：非唯一索引扫描，返回符合条件的所有值，例如：select * from user where username = "hcy";当username没有设置唯一约束时，“hcy”这个名字可能有多个
5.4.5 range：检查索引范围内的行数，例如 where 后面的 in 、between、<、>等等，这个级别的查询比全局索引快一点。毕竟索引的排列是有序的，在Btree模型下不用做全局索引
5.4.6 index：遍历索引树查找，例如：select * from user where username like 'aa%';当username字段创建索引后，这种模糊查询会优先选择走索引，“%%”这种不走索引。
5.4.7 all：这种是最慢的，当无索引可用时就会使用全表匹配的方式来执行查找，比如:like "%hcy%"
当无法查找到任何数据时，type列会显示为null，这种好像没有被归在7种type中。
5.5 possible_keys: 展示该执行单元下所能使用的索引，可能是一个或多个，这些索引并不保证会被用到。
5.6 key：查询实际使用到的索引。这里需要注意三点：a.每个执行单元只会使用一种索引;b.索引不是越多越好，如果查询数据量很少但是索引键很多，会导致执行计划选择器在选在索引上浪费更多的时间;c.尽量不要使用select *，它会使覆盖索引失效。
覆盖索引：它不是一种特殊的索引，属于索引返回数据的一种特殊表现形式。例如 select username where username = "hcy" ;如果username索引列已经命中了数据行，且select 只要求返回username这一列的数据，此时数据将会直接返回，因为没有访问原始数据列，因此这种情况被称为“覆盖索引”。如果使用的select *，mysql会认为你还需要其他的数据列，会在索引命中行后再去访问具体的数据行。如果那些多余的数据列是不需要的，后面这次查找就属于多余的消耗了。
5.7 key_len:表示索引使用的字节长度。注意这里是索引使用的长度，而不是索引的实际长度。例如：`select * from t1 where col1 = "aa" `和`select * from t1 where col1 = "aa" and col2 ="bb" `,如果我对col1和col2做联合索引，索引的实际长度肯定会很长。第一个sql明显可以再更短的索引长度内完成匹配，因此消耗更低。在使联合索引时注意列在查询条件中的位置能提高效率也是这个原因。
5.8 显示索引那一列被使用了，在关联查询中显示的是`表.列.type`,单一查询中直接显示为type
5.9 显示该执行单元下的受影响行数
5.10 extra：不适合在上面9个列中显示，但是又非常重要的信息都会显示在这个地方。
6. is null 、is not null、!= 是否使用索引，去取决于索引类型。使用explain分析sql时应该重点看extra信息。举例：
```sql
CREATE TABLE `tb1` (
  `id` int(11) NOT NULL,
  `user` varchar(20) DEFAULT NULL,
  `age` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `s2` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
当执行sql`EXPLAIN SELECT * FROM `tb1` WHERE id IS NOT NULL`时，type =all,key=null,extra = Using where
执行sql`EXPLAIN SELECT * FROM `tb1` WHERE id IS NULL` 时，type = null,key -null ,extra = impossible where
这说明is null和is not null确实没有走索引。
继续执行`EXPLAIN SELECT * FROM `tb1` WHERE USER IS NOT NULL`,type =range,key=s2 ,extra = using index condition
执行`EXPLAIN SELECT * FROM `tb1` WHERE USER IS  NULL`,type = ref,key=s2,extra=using index condition
这两种情况很显然是走索引的。而且我早前做过测试，is null 的查询效率非常高，is not null 效率略低，但是也远高于all级别的查找。
我猜测mysql在组建索引时对null涉及的数据行做了特殊处理，根据索引类型的不同会有不同的处理方式，但是不管那种方式，is null的查询效率都要高于all。
7. like '%字符串%' 这种情况并非完全不走索引，如果覆盖索引指向的字段在varchar(380)范围内，且只返回覆盖索引包含的字段，此时的查询依然会走索引。
8. 关于mysql的查询优化，我们需要注意以下几点：
8.1 永远使用小表驱动大表，也有人将其归纳为"大表在前".简单来说就是当有嵌套查询或者子查询时，尽量让小表作为嵌套查询中的条件。例如：`select t1.* from t1,t2 where t1.id = t2.id `,如果t2的数据比t1少，该sql可以优化为:`select *from t1 where id in ( select id from t2 )`;如果t2的数据大于t1的数据，可以将将sql改为`select * from t1 where exists (select 1 from t2 where t2.id = t1.id)`.这里子查询中的select 1和select * 在实际执行时都会忽略select清单，因为mysql对exists做了特殊处理，这中写法了解下就好。
8.2 尽可能将索引列放在靠前的条件中，原因参考explain中的key_len
8.3 关于order by的优化，尽可能在索引列上完成排序。举个例子`EXPLAIN SELECT * FROM tb1 WHERE id >0 ORDER BY username `,在这句sql中，`order by id`和 `order by username`的效率是不一样的。因为一个sql单元只会使用一个索引键，`where id >0`决定了这句sql必定优先使用id这个字段的索引键(where优先级高)。`order by id`会使用index排序，而`order by username`因为username上的索引没有被使用，在排序时只能使用filesort排序。
关于filesort排序mysql提供了两种算法：
双路排序：效率低，需要两次扫描磁盘，第一次锁定记录行，读取排序字段并排序；第二次在从磁盘上读取其他字段。随机I\O。
单路排序：效率高，先锁定记录行，按排序字段准备一个足够大的内存空间，顺序读取数据。顺序I\O.但是它有个弊端，当读取的数据量大于sort_buffer_size时，mysql需要多次创建临时文件来缓存这些数据(类似windows的虚拟内存交换)，此时效率反而会下降。我们可以通过`SHOW VARIABLES LIKE '%sort_buffer%'`来查看当前的sort_buffer_size并作相应的调整来减少临时文件的I\O。
只有当字段大小的总和大于`max_length_for_data`或者字段是text和blob时mysql才会使用多路排序，否则都是单路排序。
8.4 关于group by的优化，group by的实质是先排序后分组，因此只能通过索引、增大`max_length_for_sort_data`和`sort_buffer_size`来优化。
注意：where的优先级是高于group by，但是having的优先级低于group by，因此不要试图使用having来提升group by的效率。
9. DBA常用的性能调优工具，因为我们不是主做DBA，这部分了解就好：
9.1 慢查询日志功能，通过`SHOW VARIABLES LIKE '%slow_query_log%'`可以看到该功能是否开启。通过该功能我们可以定义一个阈值，超过该运行时长的sql都会被记录下来。java通过AOP可以实现类似的效果。
9.2 `show profiles`,该功能会记录sql执行时的cpu、内存等资源消耗情况。默认情况下是关闭的，但是依然会保存最近执行过的15条sql.这个功能是java不方便做的。
9.3 全局日志，通过`set global general_log =1`和 `set global log_output = 'TABLE'`开启，开启后所有的sql语句都会被记录下来，通过`select * from mysql.general_log`可以查看。
注意：上述功能默认都是关闭的，这种多余的操作都会带来性能损耗，尤其是最后一个全局日志功能
10. mysql中的锁问题，mysql中的数据行访问会存在锁问题，但是索引不会出现锁竞争的情况。而且现在的mysql默认使用innoDB，应该尽可能保证数据行能通过索引获取，避免行锁升级为表锁。这个知识点重在理解概念，我们计划无法干涉这些问题，只能通过sql优化来减少行锁范围。至于表锁时间就只能通过优化sql的执行时间和事务隔离级别来调整了。
11. mysql的主从复制不像redis那样一句话就搞定了，可以考虑使用mycat等中间件来做。