```java

/**
 * @auther hcy
 * @create 2019-12-30 10:32
 * @Description 服务端代码
 */
public class Server {
    public static void main(String[] args) throws InterruptedException {
        EventLoopGroup pGroup = new NioEventLoopGroup();
        EventLoopGroup cGroup = new NioEventLoopGroup();
        ServerBootstrap b = new ServerBootstrap();
        b.group(pGroup,cGroup)
                .channel(NioServerSocketChannel.class)
                // TCP连接需要3次握手才能完成连接。系统内核会有两个队列来分别保存已完成握手(A队列)和正在执行握手的连接(B队列)。
                // 当两个队列的总和大于SO_BACKLOG的值时，内核将不会再接受新的TCP握手请求，从而导致客户端无法连接。
                // SO_BACKLOG并不能控制程序连接数，但是会印象客户端加入B队列的效率。
                // 实测，这句话不加也可以。我没发现它有什么实质的作用
                .option(ChannelOption.SO_BACKLOG,1024)
                // 调整netty的日志级别
                .handler( new LoggingHandler(LogLevel.INFO))
                .childHandler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    protected void initChannel(SocketChannel ch) throws Exception {
                        ch.pipeline()// 添加各种自定义的ChannelHandler
                                .addLast(new UserDecoder())
                                .addLast(new ServerChannelHandler2())
                                .addLast(new ServerChannelHandler());// 在这里添加自定义的channelHandler
                    }
                });
        // 绑定端口
        ChannelFuture cf = b.bind(8765).sync();
        cf.channel().closeFuture().sync();
        pGroup.shutdownGracefully();
        cGroup.shutdownGracefully();
    }
}
```
```java
/**
 * @auther hcy
 * @create 2019-12-30 13:56
 * @Description netty客户端代码
 */
public class Client {

    //通过静态内部类实例化Client，保证全局只有一个实例，然后通过公有静态方法调用获取的这个实例对象
    private static class SingletonHolder{//①
        static final Client instance = new Client();
    }

    public static Client getInstance(){//②
        return SingletonHolder.instance;
    }
    private EventLoopGroup group;
    private Bootstrap b;
    private ChannelFuture cf;

    public Client(){
        group = new NioEventLoopGroup();
        b = new Bootstrap();
        b.group(group)
                .channel(NioSocketChannel.class)
                .option(ChannelOption.TCP_NODELAY, true)
                .handler(new LoggingHandler(LogLevel.INFO))
                .handler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    protected void initChannel(SocketChannel ch) throws Exception {
                        ch.pipeline()
                                .addLast(new UserEncoder())
                                .addLast(new UserEncoder2())
                        .addLast(new ClientHeartBeatHandler());
                    }
                });
    }
    public void connect(){
        try {
            this.cf = b.connect("127.0.0.1",8765).sync();
            System.out.println( "服务端已经连接，可以进行数据交换" );
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    public ChannelFuture getChannelFuture(){
        if ( this.cf == null ){
            this.connect();
        }
        if ( !this.cf.channel().isActive() ){
            this.connect();
        }
        return this.cf;
    }

    /**
     * 这种写法适合通讯不多的短连接。
     * 如果要用长连接，适合将通讯代码写在ChannelHandler.read()方法中，
     * @param args
     * @throws InterruptedException
     */
    public static void main(String[] args) throws InterruptedException {
        // 通过静态方法拿到全局唯一的Client
        final Client c = Client.getInstance();
        // 调用getChannelFuture()拿到连接，方法中做了重连处理
        ChannelFuture cf = c.getChannelFuture();
        HCY hcy = new HCY();
        hcy.setMsg("aa");
        hcy.setId(10);
        hcy.setData("aa");
        cf.channel().writeAndFlush(hcy );
        ReferenceCountUtil.release(hcy);
        cf.channel().closeFuture().sync();
        System.out.println( "连接断开，客户端主线程结束" );
    }
}
```
传统IO数据以流的形式传输，传输过程中双方是全程阻塞的。
NIO的数据必须转换为ByteBuf，你可以认为是一个个数据包，消息的投递和接受是异步的。因此需要对数据进行编解码。
常见的ChannelHandler介绍，所有的实现Adapter都有两个，分别对应消息的流入和流出。
ChannelOutboundHandlerAdapter：可以处理所有byteBuf
SimpleChannelInboundHandler，继承自ChannelOutboundHandlerAdapter。它提供了一个泛型，只能处理指定类型的消息。建议使用。
MessageToByteEncoder：继承自ChannelOutboundHandlerAdapter，是netty提供的一个对象编码类，一般用在pipeLine的头部。与之对应的是解码类ByteToMessageDecoder。代码如下：
```java
**
 * @auther hcy
 * @create 2019-12-31 9:15
 * @Description 解码器
 */
public class UserDecoder extends ByteToMessageDecoder {
    @Override
    protected void decode(ChannelHandlerContext channelHandlerContext, ByteBuf byteBuf, List<Object> list) throws Exception {
        byte[] bytes = new byte[byteBuf.readableBytes()];
        byteBuf.readBytes(bytes);
        Object obj = ByteToObject(bytes);
        list.add(obj);
    }

    /**
     *
     * @param bytes
     * @return
     */
    public static Object ByteToObject(byte[] bytes) {
        Object obj = null;
        ByteArrayInputStream bi = new ByteArrayInputStream(bytes);
        ObjectInputStream oi = null;
        try {
            oi = new ObjectInputStream(bi);
            obj = oi.readObject();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                bi.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
            try {
                oi.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return obj;
    }
}

/**
 * @auther hcy
 * @create 2019-12-31 8:59
 * @Description 编码器
 */
public class UserEncoder extends MessageToByteEncoder<HCY> {
    @Override
    protected void encode(ChannelHandlerContext ctx, HCY hcy, ByteBuf byteBuf) throws Exception {
        byte[] datas = ObjectToByte(hcy);
        byteBuf.writeBytes(datas);
        ctx.flush();
    }

    /**
     * 编码器工具类
     * @param obj
     * @return
     */
    public static byte[] ObjectToByte(Object obj) {
        byte[] bytes = null;
        ByteArrayOutputStream bo = new ByteArrayOutputStream();
        ObjectOutputStream oo = null;
        try {
            oo = new ObjectOutputStream(bo);
            oo.writeObject(obj);
            bytes = bo.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                bo.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
            try {
                oo.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return (bytes);
    }
}
```
将这两个ChannelHandler添加到pipeLine中，数据经过它后就被被转换为对应的泛型。编解码一般都需要发生在业务前，因此一般会将它放在pipeLine的前端。
如果是json字符串可以考虑使用如下编解码器：
```java
**
 * @auther hcy
 * @create 2019-10-22 19:49
 * @Description 编码器，负责将MsgEntity对象解析为json对象
 */
public class JsonEncoder extends MessageToByteEncoder<Object> {
    @Override
    protected void encode(ChannelHandlerContext channelHandlerContext, Object msgEntity, ByteBuf byteBuf) throws Exception {
        String json = JSON.toJSONString(msgEntity);
        channelHandlerContext.writeAndFlush(Unpooled.wrappedBuffer(json.getBytes()));
    }
}

**
 * @auther hcy
 * @create 2019-10-22 19:45
 * @Description json解码器，负责将接收到的数据反序列化为MsgEntity对象
 */
public class JsonDecoder extends MessageToMessageDecoder<ByteBuf> {
    @Override
    protected void decode(ChannelHandlerContext channelHandlerContext, ByteBuf byteBuf, List<Object> list) throws Exception {
        byte[] bytes = new byte[byteBuf.readableBytes()];
        byteBuf.readBytes(bytes);
        MsgEntity user = JSON.parseObject(new String(bytes, CharsetUtil.UTF_8), MsgEntity.class);
        list.add(user);
    }
}
```
#### 2020-06-02关于netty和nio的理论知识补充
1. 函数分为：内核函数、系统函数和一半api函数。内核函数的执行效率最高，权限最大。
早年的多路复用函数包括：select、pselect、poll、epoll等。现在基本都用epoll了。因为select有最大FD(文件描述)限制。而epoll支持的最大FD上限为文件系统支持的最大文件句柄数，1GB内存就能有上10万个句柄。而且epoll将活跃的socket和不活跃的socket分开放置，轮询效率更高(如果觉得部分socket连接都是活跃的就另算了)。
2. BIO：JDK的ServerSocket是阻塞式等待丽娜姐，如果连接成功就创建线程去执行任务。
缺点是线程资源宝贵，创建和销毁的开销都很大。容易出现线程堆栈溢出、创建线程失败等情况。
伪异步IO，将BIO中的new线程改为线程池调用。由于线程池可以设置消息队列和最大线程数，因此资源占用是可控的。
3. java中的io都是面向流操作的，在read和write方法中都有一行相识的描述：只有当数据读完或者写完，或者发生io异常时才会结束阻塞。这就好比对方没有挂电话我也要一直拿着电话，哪怕对方已经没有说话了。
4. 流使用byte装在数据，channel使用Buffer。(包装后的buffer)
流是单向的，channel是双向的
5. NIO的核心是通过selector轮询注册在其上的channel，当发现某个或多个channel处于就绪状态后，进行io操作。
JDK的NIO api太复杂，channel实例创建，注册到selector上，处理connect事件等等都要我们自己处理。
但是netty将上面这部分流程全部封装到两个线程组中了，api看起来更加简洁。在数据处理上，netty的channelHandler设计也比完全自己数据处理流程要更有层次感。netty还自己实现好了一些编解码和channelHandler基本能应对大部分的场景。常用的分包编解码器包括LineBasedFrameDecoder 按/n/r分包；DelimiterBasedFrameDecoder 按自定义分隔符分包；FixedLengthFrameDecoder 按指定长度分包
