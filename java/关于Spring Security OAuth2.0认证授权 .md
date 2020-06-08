#### 2020-05-19
Spring Security OAuth2.0认证授权,是一套成熟的企业级认证授权技术解决方案。这里记录下核心代码和一些相关的总要概念。属于自己的随手笔记，不适合新手直接观看。
整个体系的演化可以分为三个阶段：
1. 基于Spring Security 的权限控制。
2. 基于OAuth2.0的第三方认证服务
3. 将两者整合，并使用JWT令牌作为认证媒介。
##### 基于Spring Security 的权限控制
Spring Security本身就是一个权限控制框架，它解决的是系统访问权限问题，并不涉及第三方认证授权。我们在使用的过程中最核心的配置类是`WebSecurityConfigurerAdapter `,详情如下：
```java
@Configuration
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
    @Autowired
    private UserDetailsServiceImpl userDetailsServiceImpl;

    //安全拦截机制（最重要）
    @Override
    protected void configure(HttpSecurity http) throws Exception {

        http
                .authorizeRequests()//开启认证配置
                .anyRequest().authenticated()//要求所有请求都必须通过认证
                .and()//添加一个条件
                .formLogin().loginProcessingUrl("/login").permitAll()//permitAll 放行login请求，允许form访问
                .and()
                .csrf().disable()//允许跨站请求
        ;
    }
    //密码编码器
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
        //return NoOpPasswordEncoder.getInstance();
    }
    //AuthenticationManager 在OAuth2中要使用，提前放入ioc容器中，其实不写ioc容器中也有，写了idea不会提示红线
    @Override
    @Bean
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    @Override
    public void configure(AuthenticationManagerBuilder auth) throws Exception {
        //UserDetailsService类
        auth.userDetailsService(userDetailsServiceImpl)
                //加密策略
                .passwordEncoder(passwordEncoder())
        ;
    }
}
```
改代码中很多部分都不是必须的，Security提供了默认的实现。其中的重载方法`protected void configure(HttpSecurity http)`决定了你项目中的资源拦截和放行的规则。
##### 基于OAuth2.0的第三方认证服务
OAuth2.0是一套开放协议，简单来说就是一套规则。它解决的是第三方系统的认证授权问题。允许用户授权第三方应用访问他们存储在另外的服务提供者上的信息，而不需要将用户名和密码提供给第三方应用或分享他们数据的所有内容。
举个例子：我想获取用户存储在微信服务器上的身份信息，只要用户同意，微信就会将这部分数据发送给我的系统。具体怎么实现的，我们以授权码模式说明。它分为4个步骤：
1. A系统开发者(我本人)向微信服务器申请第三方授权资格。成功后微信会提供给我一个client_id和一个密码，类似我们注册微信时的账号密码。方便将来微信知道是谁在向自己索要用户数据。这个环节个用户无关，用户并不知情。
2. 当用户试图以第三方认证方式登录A系统上时，一般会是一个小按钮。浏览器出现向授权服务器授权页面，之后将用户同意授权。此时微信服务器会返回一个只能使用一次的code码给我。通过重定向后面的url携带过来。
3. 我将这个code码发送给微信服务器，此时，微信服务器会返回给我一个access_token.
4. 我在通过这个access_token向微信的用户信息服务器请求用户信息，也可以其他服务器的其他信息。只要腾讯认可这个access_token就行。
这个过程看似复杂，但是实际使用中，用户只是点击了一个按钮，输入了一次腾讯的账号密码，账号密码也没有发送给A系统，我们就能获取到用户留在腾讯服务器上的相关信息。
授权码模式：是Spring Security OAuth2.0支持的四种授权模式中最安全的一种(OAuth2.0并没有要求这些，这是Security自己在OAuth2.0协议范围内提供的四种实现方式)。这种方式也是使用最为广泛的一种。
密码模式：这种模式会将账号密码泄露给client端。适用于自己内部的其他分布式服务授权。流程上和普通系统的账号密码登场差不都。
推荐的基本就这两种。
Spring Security OAuth2.0在代码实现上的主题流程如下：
1. 创建Spring Security OAuth2.0的数据库。GitHub上的sql脚本不适合mysql，需要将sql语句中的LONGVARBINARY替换为mysql中的BLOB类型。详细sql如下：
```sql
DROP TABLE IF EXISTS `clientdetails`;

CREATE TABLE `clientdetails` (
  `appId` varchar(256) NOT NULL,
  `resourceIds` varchar(256) DEFAULT NULL,
  `appSecret` varchar(256) DEFAULT NULL,
  `scope` varchar(256) DEFAULT NULL,
  `grantTypes` varchar(256) DEFAULT NULL,
  `redirectUrl` varchar(256) DEFAULT NULL,
  `authorities` varchar(256) DEFAULT NULL,
  `access_token_validity` int(11) DEFAULT NULL,
  `refresh_token_validity` int(11) DEFAULT NULL,
  `additionalInformation` varchar(4096) DEFAULT NULL,
  `autoApproveScopes` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`appId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/*Table structure for table `oauth_access_token` */

DROP TABLE IF EXISTS `oauth_access_token`;

CREATE TABLE `oauth_access_token` (
  `token_id` varchar(256) DEFAULT NULL,
  `token` blob,
  `authentication_id` varchar(256) NOT NULL,
  `user_name` varchar(256) DEFAULT NULL,
  `client_id` varchar(256) DEFAULT NULL,
  `authentication` blob,
  `refresh_token` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`authentication_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/*Table structure for table `oauth_approvals` */

DROP TABLE IF EXISTS `oauth_approvals`;

CREATE TABLE `oauth_approvals` (
  `userId` varchar(256) DEFAULT NULL,
  `clientId` varchar(256) DEFAULT NULL,
  `scope` varchar(256) DEFAULT NULL,
  `status` varchar(10) DEFAULT NULL,
  `expiresAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastModifiedAt` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/*Table structure for table `oauth_client_details` */

DROP TABLE IF EXISTS `oauth_client_details`;

CREATE TABLE `oauth_client_details` (
  `client_id` varchar(255) NOT NULL COMMENT '客户端标\n识',
  `resource_ids` varchar(255) DEFAULT NULL COMMENT '接入资源列表',
  `client_secret` varchar(255) DEFAULT NULL COMMENT '客户端秘钥',
  `scope` varchar(255) DEFAULT NULL COMMENT '针对资源服务，客户端访问范围:read,write,trust',
  `authorized_grant_types` varchar(255) DEFAULT NULL COMMENT '指定客户端支持的grant_type,也就是支持的授权方式',
  `web_server_redirect_uri` varchar(255) DEFAULT NULL COMMENT '重定向地址',
  `authorities` varchar(255) DEFAULT NULL COMMENT '指定springSecurity的权限值',
  `access_token_validity` int(11) DEFAULT NULL COMMENT '指定access_token的有效时间范围',
  `refresh_token_validity` int(11) DEFAULT NULL COMMENT 'access_token刷新时间',
  `additional_information` longtext COMMENT '预留字段',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `archived` tinyint(4) DEFAULT NULL COMMENT '客户端是否已经存在(实现逻辑删除)',
  `trusted` tinyint(4) DEFAULT NULL COMMENT '客户端是否受信任',
  `autoapprove` varchar(255) DEFAULT NULL COMMENT '用户是否自动Approval，默认false',
  PRIMARY KEY (`client_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC COMMENT='接入客户端信息';


/*Table structure for table `oauth_client_token` */

DROP TABLE IF EXISTS `oauth_client_token`;

CREATE TABLE `oauth_client_token` (
  `token_id` varchar(256) DEFAULT NULL,
  `token` blob,
  `authentication_id` varchar(256) NOT NULL,
  `user_name` varchar(256) DEFAULT NULL,
  `client_id` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`authentication_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/*Table structure for table `oauth_code` */

DROP TABLE IF EXISTS `oauth_code`;

CREATE TABLE `oauth_code` (
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `code` varchar(255) DEFAULT NULL,
  `authentication` blob,
  KEY `code_index` (`code`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;


/*Table structure for table `oauth_refresh_token` */

DROP TABLE IF EXISTS `oauth_refresh_token`;

CREATE TABLE `oauth_refresh_token` (
  `token_id` varchar(256) DEFAULT NULL,
  `token` blob,
  `authentication` blob
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
合计7张表，但是核心表只有`oauth_client_details`一张。其他表可以认为都是和日志记录相关的表。这些表结构、表名、字段等都不可以修改，除非你要自己编译Spring Security OAuth。(可能Spring Security OAuth也支持自定义，但是我还没看到)
2. 引入`spring-cloud-starter-oauth2`和`spring-boot-starter-security`的项目依赖。
3. 配置授权服务器的安全策略,这段配置和Spring Security的配置是完全一样的，配置的就是授权服务的安全策略。
```java
@Configuration
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
    @Autowired
    private UserDetailsServiceImpl userDetailsServiceImpl;

    //安全拦截机制（最重要）
    @Override
    protected void configure(HttpSecurity http) throws Exception {

        http
                .authorizeRequests()//开启认证配置
                .anyRequest().authenticated()//要求所有请求都必须通过认证
                .and()//添加一个条件
                .formLogin().loginProcessingUrl("/login").permitAll()//permitAll 放行login请求，允许form访问
                .and()
                .csrf().disable()
        ;
    }
    //密码编码器
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
        //return NoOpPasswordEncoder.getInstance();
    }
    //AuthenticationManager 在OAuth2中要使用，提前放入ioc容器中，其实不写ioc容器中也有，写了idea不会提示红线
    @Override
    @Bean
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    @Override
    public void configure(AuthenticationManagerBuilder auth) throws Exception {
        //UserDetailsService类
        auth.userDetailsService(userDetailsServiceImpl)
                //加密策略
                .passwordEncoder(passwordEncoder())
        ;
    }
}
```
4. 在Spring Security基础上添加Oauth2.0支持，这样系统才能支持第三方认证授权、分布式系统认证等功能。具体操作是添加如下配置类
```java
@Configuration
@EnableAuthorizationServer//表示这是一个授权服务，对应的资源服务会使用注解@EnableResourceServer
public class OauthServerConfig extends AuthorizationServerConfigurerAdapter {
    //数据库连接池对象
    @Autowired
    private DataSource dataSource;
    //认证对象
    @Autowired
    private UserDetailsServiceImpl userDetailsServiceImpl;

    //授权模式专用对象
    @Autowired
    private AuthenticationManager authenticationManager;
    //密码编码器
    @Autowired
    private PasswordEncoder passwordEncoder;

    private String SIGNING_KEY = "salt";

    //客户端信息来源
    @Bean
    public JdbcClientDetailsService jdbcClientDetailsService(){
        JdbcClientDetailsService jdbcClientDetailsService = new JdbcClientDetailsService(dataSource);
        jdbcClientDetailsService.setPasswordEncoder(passwordEncoder);
        return jdbcClientDetailsService;
    }

    //token保存策略
    @Bean
    public TokenStore tokenStore() {
        return new JwtTokenStore(accessTokenConverter());
    }
    @Bean
    public JwtAccessTokenConverter accessTokenConverter() {
        JwtAccessTokenConverter converter = new JwtAccessTokenConverter();
        converter.setSigningKey(SIGNING_KEY);  //对称秘钥，资源服务器使用该秘钥来验证
        return converter;
    }
    //授权信息保存策略
    @Autowired
    public ApprovalStore approvalStore(){
        return new JdbcApprovalStore(dataSource);
    }

    //授权码模式专用对象,授权码模式数据来源
    @Bean
    public AuthorizationCodeServices authorizationCodeServices(){
        return new JdbcAuthorizationCodeServices(dataSource);
    }

    //客户端详情服务
    @Override
    public void configure(ClientDetailsServiceConfigurer clients) throws Exception {
        clients.withClientDetails(jdbcClientDetailsService());
    }

    //token 检查策略
    @Override
    public void configure(AuthorizationServerSecurityConfigurer security){
        security
                .tokenKeyAccess("permitAll()")                    //oauth/token_key是公开
                .checkTokenAccess("permitAll()")                  //oauth/check_token公开
                .allowFormAuthenticationForClients()				//表单认证（申请令牌）
                .passwordEncoder(passwordEncoder)
        ;
    }
    // oauth2的配置
    @Override
    public void configure(AuthorizationServerEndpointsConfigurer endpoints) {
        endpoints
                .approvalStore(approvalStore())
                .authenticationManager(authenticationManager)//认证管理器
                .authorizationCodeServices(authorizationCodeServices())//授权码服务
                .tokenStore(tokenStore())//令牌管理服务
                .userDetailsService(userDetailsServiceImpl)
                .tokenServices(tokenService())
                .allowedTokenEndpointRequestMethods(HttpMethod.POST)
        ;
    }

    @Bean//JWT令牌配置，不适用jwt令牌可以不用
    public AuthorizationServerTokenServices tokenService() {
        DefaultTokenServices tokenServices = new DefaultTokenServices();
        tokenServices.setClientDetailsService(jdbcClientDetailsService());
        tokenServices.setSupportRefreshToken(true);
        tokenServices.setTokenStore(tokenStore());
        tokenServices.setAccessTokenValiditySeconds(10800); // 令牌默认有效期2小时
        tokenServices.setRefreshTokenValiditySeconds(86400); // 刷新令牌默认有效期3天
        //新增对jwt配置
        TokenEnhancerChain tokenEnhancerChain = new TokenEnhancerChain();
        tokenEnhancerChain.setTokenEnhancers(Arrays.asList(accessTokenConverter()));
        tokenServices.setTokenEnhancer(tokenEnhancerChain);
        return tokenServices;
    }
}
```
这样授权服务就写好了，如果业务单一，授权服务和资源服务写在一起也是可以的。但是如果业务单一，何必要使用Spring Security OAuth2.0呢！Spring Security它不香吗?
脱离了分布式和第三方认证，使用Spring Security OAuth2.0是没有任何意义的。
5. 配置资源服务，配置类如下：
```java
@Configuration
@EnableResourceServer//资源服务注解，授权服务上也有对应的专用注解
public class ResouceServerConfig extends ResourceServerConfigurerAdapter {


    public static final String RESOURCE_ID = "res5";//资源服务的id，必须唯一。对应oauth_client_details表中的resource_ids字段。当拥有多个资源权限时，资源id使用`,`分隔
    private String SIGNING_KEY = "salt";//加密存储是用的盐，不加也可以

    @Autowired
    private DataSource dataSource;


    @Bean
    public TokenStore tokenStore(){
        return new JwtTokenStore(accessTokenConverter());
    }
    @Bean
    public JwtAccessTokenConverter accessTokenConverter() {
        JwtAccessTokenConverter converter = new JwtAccessTokenConverter();
        converter.setSigningKey(SIGNING_KEY);  //对称秘钥，资源服务器使用该秘钥来验证
        return converter;
    }

    @Override
    public void configure(ResourceServerSecurityConfigurer resources) {
        resources.resourceId(RESOURCE_ID)//资源 id
                .tokenStore(tokenStore())
                .stateless(true)
        ;
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {

        http.authorizeRequests()
                .antMatchers("/hcy/**").permitAll()
                //指定不同请求方式访问资源所需要的权限，一般查询是read，其余是write。这里的权限对应oauth_client_details表中的scope字段，注意大小写。
                //资源服务器的授权已经交给认证服务器了，这里的配置其实就是变相的对应认证服务器的权限
                .antMatchers(HttpMethod.GET, "/**").access("#oauth2.hasScope('read')")
                .antMatchers(HttpMethod.POST, "/**").access("#oauth2.hasScope('write')")
                .antMatchers(HttpMethod.PATCH, "/**").access("#oauth2.hasScope('write')")
                .antMatchers(HttpMethod.PUT, "/**").access("#oauth2.hasScope('write')")
                .antMatchers(HttpMethod.DELETE, "/**").access("#oauth2.hasScope('write')")
                .and()
                .csrf().disable()
                .headers().addHeaderWriter((request, response) -> {
            response.addHeader("Access-Control-Allow-Origin", "*");//允许跨域
            if (request.getMethod().equals("OPTIONS")) {//如果是跨域的预检请求，则原封不动向下传达请求头信息
                response.setHeader("Access-Control-Allow-Methods", request.getHeader("Access-Control-Request-Method"));
                response.setHeader("Access-Control-Allow-Headers", request.getHeader("Access-Control-Request-Headers"));
            }
        });
    }

}
```
自此，Spring Security OAuth2.0的核心配置就记录完了。基本就是两个配置类的使用。
关于JWT令牌，Spring Security已经做了对应的兼容。将默认的令牌存储方式替换下就可以了。
```java
    @Bean
    public TokenStore tokenStore(){
        return new JwtTokenStore(accessTokenConverter());
    }
```
##### 2020-05-26 补充
关于jwt令牌增强和安全性问题的补充：
1. 自定义jwt增强规则
```java
@Component
public class JWTTokenEnhancer implements TokenEnhancer {
    private static final Logger log = LoggerFactory.getLogger(JWTTokenEnhancer.class);
    @Autowired
    private UserDao userDao;

    @Override
    public OAuth2AccessToken enhance(OAuth2AccessToken oAuth2AccessToken, OAuth2Authentication oAuth2Authentication) {
        Map<String, Object> info = new HashMap<>();
        // 在这里可以添加自定义的用户信息，每次获取令牌时都会执行这个地方的逻辑。
//        QueryWrapper<UserDto> queryWrapper = new QueryWrapper<>();
//        queryWrapper.eq("username","root");
//        UserDto userDto = userDao.selectOne( queryWrapper );
//        System.out.println( userDto.toString() );
        info.put("message", "hello world");
        ((DefaultOAuth2AccessToken) oAuth2AccessToken).setAdditionalInformation(info);
        return oAuth2AccessToken;
    }
}
```
2. 在原来的配置中加入这个增强规则
```java
 // oauth2的配置
@Override
public void configure(AuthorizationServerEndpointsConfigurer endpoints) {
    endpoints
            .approvalStore(approvalStore())//客户端存储方式
            .authenticationManager(authenticationManager)//认证管理器
            .authorizationCodeServices(authorizationCodeServices())//授权码服务
            .tokenStore(tokenStore())//令牌管理服务
            .userDetailsService(userDetailsServiceImpl)//客户端详情实现
            .tokenServices(tokenService())//token服务
            .allowedTokenEndpointRequestMethods(HttpMethod.POST)
    ;
}
@Bean
    public AuthorizationServerTokenServices tokenService() {
        DefaultTokenServices tokenServices = new DefaultTokenServices();
        tokenServices.setClientDetailsService(jdbcClientDetailsService());
        tokenServices.setSupportRefreshToken(true);
        tokenServices.setTokenStore(tokenStore());
        tokenServices.setAccessTokenValiditySeconds(1080000); // 令牌默认有效期2小时   10800
        tokenServices.setRefreshTokenValiditySeconds(86400); // 刷新令牌默认有效期3天
        //新增对jwt配置
        TokenEnhancerChain tokenEnhancerChain = new TokenEnhancerChain();
        List<TokenEnhancer> enhancers = new ArrayList<>();
        enhancers.add(tokenEnhancer());//在这里增加所有的jwt增强规则
        enhancers.add( accessTokenConverter() );
        tokenEnhancerChain.setTokenEnhancers(enhancers);
        tokenServices.setTokenEnhancer(tokenEnhancerChain);
        return tokenServices;
    }
```
而且我发现自己对jwt令牌存在一个理解误区。
我们在生成令牌时指定了一个密钥，返回的令牌是一串加密后的base64字符串。我一直以为密文需要密钥才能还原令牌中的内容。但是今天我发现我几个系统中的令牌都可以直接解出来，根本不用设置密钥。
```java
@Test
public void testJWTPass(){
    String token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsicmVzNSIsInVhYSJdLCJ1c2VyX25hbWUiOiJ7XCJjcmVhdGVUaW1lXCI6MTU4OTY2OTk0ODAwMCxcImNyZWF0b3JcIjpcInJvb3RcIixcInBhc3N3b3JkXCI6XCIkMmEkMTAkTmxCQzg0TVZiN0Y5NUVYWVRYd0xuZVhnQ2NhNi9HaXB5V1I1TkhtOEswMjAzYlNRTUxwdm1cIixcInVzZXJJZFwiOlwiMTI2MzI5OTY3OTY2ODUzOTM5MlwiLFwidXNlclN0YXR1c1wiOjEsXCJ1c2VybmFtZVwiOlwicm9vdFwifSIsInNjb3BlIjpbInJlYWQiLCJ3cml0ZSJdLCJleHAiOjE1OTE1NDU4NDcsIm1lc3NhZ2UiOiJoZWxsbyB3b3JsZCIsImF1dGhvcml0aWVzIjpbIi90ZXN0UmVzb3VyY2UvdCIsIi91YWEvZ2V0U2VydmVyTGlzdCIsIi91YWEvdGVzdCJdLCJqdGkiOiJkYmE0YWUxMS00YjE3LTRlMGItYTllMS01YTRmYWEzOWI3ZDgiLCJjbGllbnRfaWQiOiJjMyJ9.vXW4xMLxsue8EvNYQ84RMNZd9qCPb5Sc6f54tW0JKHw";
    token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyb290Iiwicm9sZSI6MSwib3JnX0lkIjowLCJpc3MiOiJoY3kiLCJ1c2VyTmFtZSI6InJvb3QiLCJleHAiOjE1OTA0Njg0NzUsInVzZXJJZCI6MSwiaWF0IjoxNTkwNDY0ODc1fQ.SJA2adSyZPtsVXAliCmcKPLwoatupwpWj6QS4Rb-IIOwFQVEmDUtx34c_Kw-17jz81kP1-QCgICY8F2qi9Fpbw";
    JwtHelper.decode(token);
    System.out.println( JwtHelper.decode(token) );//{"alg":"HS512"} {"sub":"root","role":1,"org_Id":0,"iss":"hcy","userName":"root","exp":1590468475,"userId":1,"iat":1590464875} [64 crypto bytes]
    Jwts.parser().setSigningKey(SECRET).parseClaimsJws(token).getBody();//上面哪个方法可以认为就是看看令牌，这个方法才是检验令牌真伪
}
```
翻阅资料后发现，token其实分为3部分：头部，载荷，签名。
其中载荷里面放的就是我们自己定义的用户数据，这部分数据就是普通的base64编码，不需要密钥就能解出来。
密钥真正作用在签名上。以上面的结果为例，HS512这种算法是不要密钥的，但是服务器收到这个token令牌后会根据头部的HS512和服务器的密钥来联合计算(具体实现我也没太明白，不影响我们使用jwt)，确认第三部分的签名是不是自己发出的。如果是我才承认这个令牌的合法性。
这就好比生活中张三给我看他的证件，虽然我不认识证件上的印章(签名)是不是真的，但是证件上名字“张三”这两个字我是认识的。如果张三去政府机关办事，别人自然有办法来核查印章的真为.令牌对内部系统来说是通行证，对外不系统，可以视作名片。因此荷载部分不应该发放任何敏感信息。
*****************分割线**********************************
补充一个疑问：
oauth2的资源配置类继承自`ResourceServerConfigurerAdapter`,Security的配置类继承自`WebSecurityConfigurerAdapter`.
oauth2的配置优先级高于Security，而HttpSecurity中，任何一个拦截匹配规则满足就会放行请求。这样Security中的安全拦截机制就完全失效了。
oauth2中的权限scope只跟着client走的。如何才能在client放行的情况下还是检查userDetails.authorities()中的权限呢？
还是说只能自己再写逻辑来实现(自己判断authorities，参考uam)？
