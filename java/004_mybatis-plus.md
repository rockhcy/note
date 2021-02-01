#### 2019-12-29
mybatis-plus笔记：建议项目创建两个实体类包，一个bean用与对接复查sql(还是使用原来的mybatis的接口+xml)；还有一个entity用来对接数据库操作，使用AR模式，我觉得这样比较好看。记录几个骚气的写法吧！
注意：**mybatis-plus提供了 逻辑删除、自定义自动填充规则、乐观锁、多租户、动态表名等功能**这些功能用的都比较少，或者可以通过自身逻辑代码实现。需要用到的时候再去细看，比如动态表名 这个功能可以在VEIDP中配合数据分区使用，来替换原来的mysql自定义函数。
```pro
# 可能会用到的配置，其实一般使用默认配置就可以了
mybatis-plus:
  # 指定读取mybatis的配置文件位置，注意 config-location和configuration不能同时出现，否则项目无法启动
  # config-location: classpath:mybatis-config.xml.xml
  # 指定sql xml的文件位置，多模块下需要使用classpath*:,单模块下可以直接classpath:
  mapper-locations: classpath*:mybatis/*.xml
  # 指定包路径，这样在xml中就不用写全类名了，直接写类名就好
  type-aliases-package: com.example.demo.demo1
  # 全局配置，当全局配置和局部配置冲突时，以局部配置优先
  global-config:
    db-config:
      # 主键id的生成策略
      id-type: id_worker
      # 约定sql在insert，update等操作时如果字段为null时默认会舍弃这个字段，
      # 在3.1.2中取消了这个全局配置，改为@insertStrategy、@updateStrategy、@selectStrategy三个注解，直接在实体类上控制字段
      # field-strategy:
      # 表明前缀
      # table-prefix: hcy_
      # 表明是否使用下划线,不知道有什么用
      table-underline: true
      # 全局设置逻辑删除中 删除和未删除所使用的默认值，默认就是1-删除，0-未删除。该功能要和实体类上的@TableLogic注解配合使用
      logic-not-delete-value: 0
      logic-delete-value: 1

  configuration:
    map-underscore-to-camel-case: true
spring:
  datasource:
    # serverTimezone=GMT%2B8可以解决时区问题
    url: dbc:mysql://localhost:3306/mybatis_demo?serverTimezone=GMT%2B8&useSSL=false
```
```java
package com.example.demo.demo1;

import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.Data;
import sun.rmi.runtime.Log;

/**
 * @auther hcy
 * @create 2019-12-20 10:41
 * @Description 实体类的写法，AR模式可以和mapper共存
 */
@Data
//@TableName(value = "user")  //表名注解
public class User extends Model<User> {
    @TableId  //主键注解，告诉plus这个是主键，不加该注解plus会认为叫id的是主键.默认采用雪花算法生成主键id
    private Long id;
    //@TableField(condition = SqlCondition.LIKE_LEFT)  //该字段每次查询都使用有关联查询
    private String name;
    //@TableField(condition = "%s&lt;#{%s}")  //该字段每次查询都使用< 传入的值
    private Integer age;
    private String email;
    // exist 默认为true，表示它是数据库中的字段，false表示它不是数据库中的字段，执行sql时会忽略这个字段
    @TableField(exist = false)
    private String remark;
}
// 接口通过继承BaseMapper来获得到对应的crud方法
@Mapper
public interface UserMapper extends BaseMapper<User> {
}
/**
    * 创建日期为2019年2月14日并且直属上级为名字为王姓
    */
@Test
public void test4(){
    QueryWrapper<User> queryWrapper = new QueryWrapper<>();
    //apply 用于数据库函数的动态织入，{index}这个用于向传入，index表示取后面的第几个参数，下标从0开始
    queryWrapper.apply(" date_format(create_time,'%Y-%m-%d') = {1} ","2019-12-12","2019-12-23");
    //queryWrapper.inSql("id","select id from user where name like '王%'");
    List<User> list = userMapper.selectList(queryWrapper);
    list.forEach( System.out::println );
}
@Test
public void test10(){
    String email = "";
    QueryWrapper<User> queryWrapper = new QueryWrapper<>();
    //允许传入3个参数，第一个参数为boolean类型，就决定后面的条件是否生效.
    // 等价于xml中的if ，如果email 不等于null，也不等于""，就添加按这个字段做模糊筛选的条件
    queryWrapper.like(StringUtils.isNotEmpty(email),"email",email);
}
@Test
public void test11(){
    User user = new User();
    user.setName("J");
    user.setAge(32);
    // 支持以实体类为条件构造器的方法参数，这里等价与 SELECT id,name,age,email FROM user WHERE name=? AND age=?
    // 如果实体类上的某个属性添加了注解 @TableField(condition = SqlCondition.LIKE_LEFT)，则表示某个字段在查询时使用模糊查询
    // 这种情况很适合控制查询条件强制走索引的场景
    // condition = 可以是一个表达式 ，比如："%s&lt;#{%s}" ,年龄小于传入的数值
    //QueryWrapper<User> queryWrapper = new QueryWrapper<User>(user);
    // 当通过实体类限制查询条件时如果条件和实体类中的注解条件重合，则两种情况下的条件都会生效，例如：
    //----------------------------------------   实体类注解中的条件  ----------   AND -- 条件分析器中又追加的条件
    // SELECT id,name,age,email FROM user WHERE name LIKE CONCAT('%',?) AND age<? AND (name LIKE ? AND age > ?)
    QueryWrapper<User> queryWrapper = new QueryWrapper<User>(user);
    queryWrapper.likeRight("name","hcy").gt("age",30);
    userMapper.selectList(queryWrapper);
}
/**
    * Lambda条件构造器，无形装逼，最为致命！
    * 注意：这里用的 LambdaQueryWrapper 而不是 QueryWrapper。
    * LambdaQueryChainWrapper 允许将mapper对象传入，直接链式执行sql并返回结果
    */
@Test
public void test13(){
    LambdaQueryWrapper<User> lambdaQueryWrapper = Wrappers.<User>lambdaQuery();
    lambdaQueryWrapper.likeRight(User::getName,"hcy").and(q->q.lt(User::getAge,28).or().isNotNull(User::getEmail));
    // SELECT id,name,age,email FROM user WHERE (name LIKE ? AND ( (age < ? OR email IS NOT NULL) ))
    userMapper.selectList(lambdaQueryWrapper);
    System.out.println("----------------------------------");
    // SELECT id,name,age,email FROM user WHERE (name LIKE ? AND age >= ?)
    List<User> users = new LambdaQueryChainWrapper<User>(userMapper).like(User::getName,"hcy").ge(User::getAge,20).list();
}

@Test
public void test12(){
    QueryWrapper<User> queryWrapper = new QueryWrapper<User>();
    //queryWrapper.like("name","h");
    //queryWrapper.like("age",28);
    // SELECT id,name,age,email FROM user WHERE (name LIKE ? AND age LIKE ?)
    Map<String,Object> map = new HashMap<>();
    map.put("name","h");
    map.put("age",23);
    // 对map参数进行筛选，去除 map中key为"a"的这一组条件，这个地方有点饶，函数式编程貌似都有点绕，但是看着就很牛逼
    queryWrapper.allEq((k,v)->!k.equals("a"),map);
    //queryWrapper.allEq(map);
    userMapper.selectList(queryWrapper);
}
/**
    * AR模式，实体类通过继承Model<T>来获取数据库的操作方法。
    */
@Test
public void testAR(){
    User u = new User();
    u.setRemark("aa");
    u.setName("aaa");
    u.setId(2210480163266715649l);
    //u.insert();
    // 数据存在就更新，不存在就插入。判断数据是否存在的标准是id，在未设置id的情况下会一直插入
    // 这句话在执行时依然会触发两句sql，先查记录是否存在，然后再确定是执行insert还是update
    u.insertOrUpdate();
}
@Test
public void deleteTest(){
    // 删除时条件对象使用的依然是QueryWrapper
    QueryWrapper<User> queryWrapper = new QueryWrapper<>();
    queryWrapper.lt("age",10).eq("name","hcy");
    userMapper.delete(queryWrapper);
}

/**
    * update时需要使用UpdateWrapper来封装条件，在 LambdaUpdateChainWrapper中要在最后调用一次update()才能正常执行更新。
    * 可以认为前面的都是中间操作，update()才是终值操作
    */
@Test
public void updateTest(){
    UpdateWrapper<User> userUpdateWrapper = new UpdateWrapper<>();
    /*User u = new User();
    u.setRemark("aa");*/
    Boolean b= new LambdaUpdateChainWrapper<User>(userMapper).eq(User::getName,"h").lt(User::getAge,10).
            set(User::getEmail,"123").update();
    System.out.println( b );
}
@Test
public void selectUserPage(){
    QueryWrapper<User> queryWrapper = new QueryWrapper<>();
    // Page 的构造方法中第3个boolen值可以不传，默认为true。false下sql查询时不会执行计数统计的那一次查询
    Page<User> page = new Page<User>(1,2,false);
    System.out.println( userMapper.selectPage(page,queryWrapper)  );
    System.out.println("-*");
}

/**
    * 使用自定义sql,要配合接口上的注解才能实现
    */
@Test
public void test14(){
    QueryWrapper<User> queryWrapper = new QueryWrapper<User>();
    queryWrapper.likeRight("name","hcy").and(q -> q.lt("age",20));
    userMapper2.selectAll(queryWrapper);
}
```