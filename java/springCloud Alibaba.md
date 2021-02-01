##### 2020-05-25 
本篇主要记录springcloud Alibaba全家桶中的相关服务组件的使用。
#### nacos
#### sentinel
sentinel是一个服务降级、限流框架，类似Hystrix。
在使用感觉上，sentinel自带监控界面，各种降级策略能在页面直接配置，使用起来更加友好。操作流程如下：
1. 下载sentinel服务端jar包，执行 `java -jar sentinel.jar`,启动sentinel服务端
1. 项目中引入sentinel依赖
```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```
2. 修改yml，指向sentinel服务
```yml
spring:
  application:
    name: test_resource
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848 #将nacos作为注册中心
      config:
        server-addr: localhost:8848 #将nacos作为配置中心
        file-extension: yaml #指定使用yaml格式
    sentinel: #sentinel配置
      transport:
        dashboard: localhost:8080 #sentinel服务访问地址
        port: 8719 #客户端的API监控端口，默认8719，如果8719被占用，会自动+1直到有可用端口为止。
        #他会在对应的机器上启动一个http server和sentinel做交互
```
3. 添加`@SentinelResource `注解
```java
@GetMapping("/hcy/h")
@SentinelResource(value = "hcy",//资源名称，一般和url一致.必填，将来要和web中的限流策略中的资源名对用
        blockHandlerClass = CustomerBlockHandler.class,//如果触发降级、限流 使用哪个类来处理
        blockHandler = "handlerServerErr",//和上面的blockHandlerClass配套使用，指定使用类中的哪个方法来处理
        exceptionsToIgnore = NumberFormatException.class//指定需要排除的异常类型，当资源发生这个异常时不会触发降级
)
public String test2(){
    return " 不需要权限 ";
}
```
`@SentinelResource` 注解中还有一个`fallback`属性使用的频率也很高，用于指定资源发生降级后用于兜底的方法。
blockHandlerClass和fallback对应的方法需要放在和资源同一个类中，或者将方法声明为static。
blockHandlerClass 一般用于指定全局处理方式，fallback用来指定个体化的处理方式（这是我自己的理解）
4. 在web页面配置各种需要保护的资源和对应的策略
