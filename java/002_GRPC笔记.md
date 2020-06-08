RPC (remote procedure call)远程过程调用。所有的RPC协议都一样，原则上都是要调用远端的服务来执行业务逻辑。不管是远端的服务调用，还是本地方法的调用，在调用时都需要用到最基本的两个信息：方法名和参数列表。
RPC调用的效率主要受两个因素影响：1.序列化和反序列化；2.传输字节大小。
传统的HTTP协议本身也可以认为是RPC的一种，但是因为http协议中对于服务调用来说包含了太多的无用信息。同时使用HTTP协议时，数据一般会以json格式传输，这两个原因都导致Http的调用方式效率要远远低于TCP。
国内使用比较多的dubbo支持tcp和自定义协议头，同时可以自行扩展序列化方式，因此效率非常高。
我们今天要介绍的GRPC其实和dubbo差多，都是一个RPC框架。区别是GRPC使用`proto`文件来定义要传输的内容，同时提供了一个特殊的编译器，将`proto`中的内容编译为各种语言对应的文件。比如你可以将proto文件编译为对应的.java文件，也能编译为.py文件。
实际使用时，服务提供者只需要写好一个proto的接口文件发送给调用者。调用者根据自己实际的开发语言来将proto使用谷歌提供的特定编译器编译为自己所需要的文件就可以了。
以java为例，下面是具体的使用方法:
1. 拿到proto文件。一般proto文件由服务提供者编写。下面是一个proto文件示例，具体语法用到的时候再去查，这玩意万年写一次，现在背下来估计在用的时候也忘了
```proto
# 第一行指定版本号，如果没有编译器会报错。
syntax = "proto3";
# 默认为false，可以不写。当赋值为true时，proto会被编译为多个java文件，默认是编译为一个java文件
option java_multiple_files = true;
# 编译成Java文件后的包名
option java_package = "io.grpc.examples.calculator";
# 编译后生成的java文件的类名
option java_outer_classname = "calculatorProto";
# 不知道这句话什么意思,不加也是可以使用的，反正我能用。
option objc_class_prefix = "HLW";
# 貌似是服务提供者的包名
package calc;
# 服务提供者要提供的服务方法名，也就是你要调用那个方法
service Caltulator {
        rpc Add(Request) returns (Response) {}
}
# 发起请求的参数列表，这里需要申明参数类型
message Request {
        int32 a = 1;
        int32 b = 2;
}
# 服务调用后的返回值类型
message Response {
        int32 sum = 1;
}
```
2. 编译proto文件。我们需要先去它的官网下载他的编译器，下载完成后使用`bin/protoc.exe`进行编译。
`PS F:\protobuf\p2\bin> .\protoc.exe --java_out=F:\protobuf\p2\bin\java .\calculator.proto`
命令参数说明：`--java_out=编译生成的Java的输出路径 要编译的proto文件所在的路径`，注意此时产生的protobuf是用于序列化和反序列化的代码，还没有生成gRPC的通讯代码。
`PS F:\protobuf\p2\bin> .\protoc.exe --plugin=protoc-gen-grpc-java=C:\Users\rock\Desktop\testGrpc\target\protoc-plugins\protoc-gen-grpc-java-1.9.1-windows-x86_64.exe       --grpc-java_out=./java/       .\calculator.proto`
命名参数说明：`--plugin=protoc-gen-grpc-java=生成grpc通讯代码需要的插件的路径       --grpc-java_out=生成的通讯代码的存放路径       要编译的proto文件所在的路径`，此时生成的这个java文件才是真的用于通信的文件。
3. 使用Java调用远程服务
```java
package com.example.demo.grpcTest;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.StatusRuntimeException;
import io.grpc.examples.calculator.CaltulatorGrpc;
import io.grpc.examples.calculator.calculatorProto;

import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;


public class CalcClient {
    private static final Logger logger = Logger.getLogger(CalcClient.class.getName());

    private final ManagedChannel channel;
    private final CaltulatorGrpc.CaltulatorBlockingStub blockingStub;

    /**
     * Construct client connecting to HelloWorld server at {@code host:port}.
     */
    public CalcClient(String host, int port) {
        //其实有用的就两句话 ，2
        this(ManagedChannelBuilder.forAddress(host, port)
                // Channels are secure by default (via SSL/TLS). For the example we disable TLS to avoid
                // needing certificates.
                .usePlaintext()
                .build());

    }

    CalcClient(ManagedChannel channel) {
        this.channel = channel;
        blockingStub = CaltulatorGrpc.newBlockingStub(channel);
    }

    public void shutdown() throws InterruptedException {
        channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
    }

    public void Add(int a, int b) {
        calculatorProto.Request request = calculatorProto.Request.newBuilder().setA(a).setB(b).build();
        calculatorProto.Response response;
        try {
            response = blockingStub.add(request);
        } catch (StatusRuntimeException e) {
            logger.log(Level.WARNING, "RPC failed: {0}", e.getStatus());
            return;
        }
        int sum = response.getSum();
        System.out.println(a + " + " + b + " = " + sum);
    }

    public static void main(String[] args) throws Exception {
        //其实有用的就两句话 ，1
        CalcClient client = new CalcClient("192.168.50.88", 50051);
        try {
            client.Add(1, 2);
        } finally {
            client.shutdown();
        }
    }
}
```
还有办法是使用maven插件，网上大多推荐这种用法。我也建议使用这种方法。但是maven插件隐藏了很多细节，建议理解原理和流程后再使用这种插件。
maven插件配置方法
```xml
<plugin>
    <groupId>org.xolstice.maven.plugins</groupId>
    <artifactId>protobuf-maven-plugin</artifactId>
    <version>0.5.1</version>
    <configuration>
        <!--该插件用于生成序列化文件-->
        <protocArtifact>com.google.protobuf:protoc:3.7.1:exe:${os.detected.classifier}</protocArtifact>
        <pluginId>grpc-java</pluginId>
        <!--该插件用于生成通讯文件-->
        <pluginArtifact>io.grpc:protoc-gen-grpc-java:1.9.1:exe:${os.detected.classifier}</pluginArtifact>
        <!-- 该路径决定proto文件的存放路径 -->
        <protoSourceRoot>src/test/proto</protoSourceRoot>
    </configuration>
    <executions>
        <execution>
            <goals>
                <goal>compile</goal>
                <goal>compile-custom</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```
分别执行`protobuf:compile`和`protobuf:compile-custom`来生成对应的文件
