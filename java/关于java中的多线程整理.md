## 本文主要记录java中的多线程操作，线程同步、异步的常用操作方法，synchronized，threadlocal等所有和线程和线程安全操作相关的内容都记录在这里
>### 1.线程的创建：继承Thread类和实现Runnable接口的区别
>### 结论：runnable中多个线程间的数是共享的，适合多线程处理同一件事的场景；Thread中数据独立，适合多线程做同样的事情，但是线程间并不知道对方的存在，这样的场景。事例代码如下：
```java
@Test
    public void contextLoads() {
        ThreadDemo mt1= new ThreadDemo("一号窗口");
        ThreadDemo mt2= new ThreadDemo("二号窗口");
        ThreadDemo mt3= new ThreadDemo("三号窗口");
        mt1.start();
        mt2.start();
        mt3.start();//三个线程合计售票30张，每个线程的数据都是独立的，互相间不知道对方

        RunableDemo mt = new RunableDemo();
        Thread t1 = new Thread(mt,"一号窗口");
        Thread t2 = new Thread(mt,"二号窗口");
        Thread t3 = new Thread(mt,"三号窗口");
        t1.start();
        t2.start();
        t3.start();//三个线程合计售票10张，三个线程共享ticket中的10张票

    }


    //继承Thread类，重写run方法.的存在
    class ThreadDemo extends Thread{
        private int ticket =10;
        private String name;
        public ThreadDemo(String _name) {
            this.name = _name;
        }
        @Override
        public void run() {
           for ( int i=0;i<500;i++ ){
               if ( ticket>0 ){
                   System.out.println(this.name+"卖票------>"+(this.ticket--));
               }
           }
        }
    }
    //实现runable接口，
    class RunableDemo implements Runnable{
        private int ticket =10;
        private String name;
        @Override
        public void run() {
            for ( int i=0;i<500;i++ ){
                if ( ticket>0 ){
                    System.out.println(Thread.currentThread().getName()+"卖票------>"+(this.ticket--));
                }
            }
        }
    }

```
>### 2.实现线程同步异步常用的api：wait()/notify()/notifyAll()/THREAD.sleep()/suspend()/resume()/yield()/join(miliSec)
>### 总结：wait()/notify()/notifyAll() 三个方法是object中就拥有的，这就意味着所有对象都拥有这3个方法。这三个方法通常要配合synchronized使用。wait()方法会使当前线程释放锁，notifyAll()则会唤醒在等待此对象监视器上的所有线程，notify()通知等待队列中的第一个线程(这句话有点绕，忘记了就结合实例去理解)。
>##### 举例：synchronized对象锁有一个非常今典的使用场景：生产消费模式。现在的很多消息中间件原型就是基于这个模式。代码如下：
```java

import cn.hutool.core.util.RandomUtil;
import java.util.Queue;

/**
 * @Author: hcy
 * @Date: 2019/8/16 21:07
 * 生产者,
 * 当队列未达到最大值时持续向队列中添加数据，
 * 当队列达到最大值时让出cpu，并唤醒消费者
 */
public class produce extends Thread{
    private Queue<Integer> queue;
    private int maxsize;

    public produce(Queue<Integer> storageQueue,int _max) {
        this.queue = storageQueue;
        this.maxsize = _max;
    }

    @Override
    public void run() {
        while (true){
            synchronized (queue){
                if ( queue.size()==maxsize ){
                    try {
                        System.out.println("生产者,唤醒其他线程");
                        queue.notifyAll();//通常情况下我们都是先唤醒全部线程，在让当前线程进入等待。这个地方一定要注意，不然容易出现线程死锁的情况
                        System.out.println("生产者,自己进入等待");
                        queue.wait();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }

                int i =RandomUtil.randomInt();
                this.queue.add(i);
                System.out.println("生产者："+Thread.currentThread().getName()+"产生了一条数据--->  "+i);
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }

            }

        }
    }
}

import java.util.Queue;

/**
 * @Author: hcy
 * @Date: 2019/8/16 21:19
 * 消费者
 * 当队列中有数据时消费数据
 * 当队列中没有数据时让出cpu，并唤醒生产者
 */
public class consume extends Thread{

    private Queue<Integer> queue;
    private int maxsize;

    public consume(Queue<Integer> storageQueue,int _max) {
        this.queue = storageQueue;
        this.maxsize = _max;
    }

    @Override
    public void run() {
        while (true){
            synchronized (queue){
                while (queue.size()>0){
                    System.out.println("消费者："+Thread.currentThread().getName()+"消费了一条数据--->>  "+queue.poll());
                }
                System.out.println("消费者,唤醒其他线程");
                queue.notifyAll();
                try {
                    System.out.println("消费者,自己进入等待");
                    queue.wait();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}


package com.vesystem.file_serves.notifyDemo;

import java.util.ArrayDeque;
import java.util.Deque;

/**
 * @Author: hcy
 * @Date: 2019/8/16 21:31
 * 生产消费模型
 * 两个线程会交替执行
 */
public class StorageDemo{
    //仓库的最大容量
    private static final  int max_size = 10;
    //仓库载体
    private  static  Deque<Integer> queue = new ArrayDeque<>();

    public static void main(String[] args) {
        produce p1 = new produce(queue,max_size);
        consume c1 = new consume(queue,max_size);
        p1.start();
        c1.start();
    }
}

```
>#### suspend()&resume() 也能达到和wait()/notify()一样的效果。区别是这两个方法属于Thread类，并且suspend()方法在让线程进入等待状态时不会释放锁。这就极易造成死锁的情况出现，因此JDK8中将这两个方法标记为已经过时的方法。
>#### sleep() 让线程进入阻塞状态一段时间，任何线程都有可能获取执行权。而yield()方法是让线程让出已经获取的cpu时间，让出的cpu时间会分给线程优先级等于或高于自己的线程，当然也有可能自己刚让出时间就立刻再次获得时间。这两个方法在实际编码中用的并不多
>#### join()这个方式应该是使用比较频繁的一个方法。一般用于主线程等待子线程执行结束后主线程在继续执行。我们打开JDK源码会发现如下：
```java
// 它存在3个重载方法，用于控制主线程等待子线程执行的时间。方法被synchronized修饰，此时锁定的对象为this，也就是主线程自己。主线程会调用wait()进入等待状态，因为锁就在主线程上，所以不用考虑死锁的情况
public final synchronized void join(long millis)
    throws InterruptedException {
        long base = System.currentTimeMillis();
        long now = 0;

        if (millis < 0) {
            throw new IllegalArgumentException("timeout value is negative");
        }

        if (millis == 0) {
            while (isAlive()) {
                wait(0);
            }
        } else {
            while (isAlive()) {
                long delay = millis - now;
                if (delay <= 0) {
                    break;
                }
                wait(delay);
                now = System.currentTimeMillis() - base;
            }
        }
    }
```
### 3. ThreadLocal和synchronized 的区别。
>#### ThreadLocal和synchronized都可以解决线程安全问题，区别是synchronized是用过加锁的方式来保证一直有一个线程可以操作对象或数据，这样做安全，但是效率低。ThreadLocal的处理方式类似为每个线程都提供了一份数据副本，各个线程操作的都是自己的副本数据，这样做效率高，但是会产生类似“脏读”的情况。 这里列举一个通过ThreadLocal来记录全局日志的demo
```java
import lombok.Data;

import java.util.Date;

/**
 * @Author: hcy
 * @Date: 2019/8/14 17:01
 * 记录请求情况的实体类
 */
@Data
public class LogEntity {

    private String url;//访问url
    private String ip;//访问者的ip
    private String httpMethod;//请求方式
    private String classMethod;//接收请求的方法
    private String args;//请求参数列表
    private String respParams;//响应参数
    private Date requestDate;//请求时间
    private long spendTime;//从请求到响应的耗时
}
```
```java
package com.vesystem.veuam.common.aop;

import cn.hutool.crypto.SecureUtil;
import cn.hutool.extra.servlet.ServletUtil;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.util.Date;

/**
 * @Author: hcy
 * @Date: 2019/8/14 16:41
 * 全局日志切面
 */
@Aspect
@Component
@Order(1)
public class ControllerLogAspect {
    private Logger logger = LoggerFactory.getLogger(this.getClass());
    ThreadLocal<Long> startTime = new ThreadLocal<>();
    //通过ThreadLocal为每个线程都提供一个LogEntity副本，这样各个线程修改的都是自己的副本数据，这样就不会出现线程安全问题了
    ThreadLocal<LogEntity> logThreadLocal = new ThreadLocal<>();
    //切入点为所有模块下的所有controller下的所有方法
    @Pointcut("execution(public * com.vesystem.veuam.modules.*.controller.*.*(..))")
    public void serviceAspect(){ }

    @Before("serviceAspect()")
    public void doBefore(JoinPoint joinPoint){
        startTime.set(System.currentTimeMillis());
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes.getRequest();
        logThreadLocal.set(new LogEntity());
        logThreadLocal.get().setUrl(request.getRequestURI());
        logThreadLocal.get().setIp(request.getRemoteAddr());
        logThreadLocal.get().setHttpMethod(request.getMethod());
        logThreadLocal.get().setClassMethod(joinPoint.getSignature().getDeclaringTypeName() + "." + joinPoint.getSignature().getName());
        logThreadLocal.get().setArgs(JSON.toJSONString(ServletUtil.getParams(request)));
        logThreadLocal.get().setRequestDate(new Date());
    }

    @AfterReturning(returning = "result", pointcut = "serviceAspect()")
    public void doAfterReturning(Object result){
        ObjectMapper mapper = new ObjectMapper();
        try {
            logThreadLocal.get().setRespParams(mapper.writeValueAsString(result));
        } catch (JsonProcessingException e) {
            logger.error("切面方法记录请求返回值是发生错误-->"+e.getMessage());
        }
        logThreadLocal.get().setSpendTime(System.currentTimeMillis() - startTime.get());
        // 将数据以json字符串形式保存，方便将来可能存在的扩展分析
        logger.info(JSON.toJSONString(logThreadLocal.get()));
    }
}
```
### 4.java.util.concurrent JDK并发包中常见的用法
>#### 这一块我们重点需要在掌握线程池，定时线程池和栅栏（CountDownLatch）的概念。事例代码如下：
```java
//创建一个任务类，我们模拟运动员跑步的场景
class Runner extends Thread{
	private String  name;
	private long time;//跑步时长
	public Runner(String  _name,long _time){
		this.name = _name;
		this.time = _time;
	}

	@Override
	public void run() {
		System.out.println("运动员："+this.name+"开始跑步");
		try {
			Thread.sleep(3000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		System.out.println("运动员："+this.name+"跑步结束");
	}
}
```
>#### 常见的几种线程池
```java
        private static String[] names = {"张1","张2","张3","张4","张5","张6","张7","张8"};
	private static long[] times = {1000,2000,1500,1200,1800,3000,2000,1500};
    //三种常见的线程池
	@Test
	public void threadDemo(){
		//ExecutorService executorService = Executors.newCachedThreadPool();//创建无界限的线程池，8个线程同时执行
		//ExecutorService executorService = Executors.newFixedThreadPool(4);//创建固定大小的线程池，先执行4个线程，完了再执行下一批
		ExecutorService executorService = Executors.newSingleThreadExecutor();//创建单个后台线程的执行器，也就是单线程执行
		for (int i=0;i<names.length;i++){
			Runner runner = new Runner(names[i],times[i]);
			executorService.submit(runner);
		}
	}
```
>#### 具备定时和反复执行功能的线程池
```java
        private static String[] names = {"张1","张2","张3","张4","张5","张6","张7","张8"};
	private static long[] times = {1000,2000,1500,1200,1800,3000,2000,1500};

	//创建的线程池会在指定时间后开始运行，并且间隔固定时间运行一次
	@Test
	public void threadDemo2(){
		ScheduledExecutorService ses = Executors.newScheduledThreadPool(4);//创建一个具有定时功能的线程池，核心线程数为4
		System.out.println("准备开始");
		Runner runner = new Runner(names[0],times[0]);//创建任务
		//将任务添加到线程池中，并指定5秒后开始第一次执行，并且每间隔8秒执行一次，执行时间会被算在间隔时间内。如果任务运行需要5秒，
		// 则第一次结束的时间和第二次开始的时间，实际间隔只有3秒
		ses.scheduleWithFixedDelay(runner,5,10,TimeUnit.SECONDS);
		while (true);//保证程序不会结束，这样才能看到线程池中的线程输出
	}
```
>#### 栅栏
```java
        private static String[] names = {"张1","张2","张3","张4","张5","张6","张7","张8"};
	private static long[] times = {1000,2000,1500,1200,1800,3000,2000,1500};
	CountDownLatch start = new CountDownLatch(1);//设置开始计数器为1，这样countDown()方法调用时计数器-1，当计数器归零时线程池中的任务启动
	CountDownLatch end = new CountDownLatch(names.length);//设置结束计数器为任务长度，每完成一个任务就将计数器-1
	// ExecutorService 也叫栅栏，用于控制线程池中的线程再同一时间(countDown()方法触发时)开始执行。
	@Test
	public void threadDemo3() throws InterruptedException {
		ExecutorService es = Executors.newCachedThreadPool();//创建一个无边界的线程池
		System.out.println("所有选手入场");
		for (int i=0;i<names.length;i++){//循环创建线程任务
			final  int index = i;
			Runnable runnable = new Runnable() {
				@Override
				public void run() {
					try {
						start.await();//任务加入到栅栏中
						System.out.println(index +"开始跑");
						Thread.sleep(times[index]);
						System.out.println(index+"完成跑");
					} catch (InterruptedException e) {
						e.printStackTrace();
					}finally {
						end.countDown();//当有任务完成时栅栏计数器-1
					}
				}
			};
			es.submit(runnable);//将任务添加到线程池中
		}
		start.countDown();//开始计数器-1，触发任务开始
		System.out.println("发令枪响了");
		end.await();//设置栅栏，要所有任务都执行完后才能执行后面的代码，也就是颁奖环节，人没到齐就不能开始颁奖
		System.out.println("所有人都跑完了，开始颁奖");
		es.shutdown();//执行一次关闭线程池，关闭前会先执行完线程池中已有的任务，同时不再接收新的任务
	}
```
#### 5.java.util.concurrent.atomic
#### 6.java.util.concurrent.locks
>##### 在了解并发包中的锁和原子操作前我们需要先理解一些概念，了解这些思想有助于我们更好的理解这些知识点
>1. 内存：计算机执行逻辑处理的地方，所有的数据都会被加载到内存中才能执行逻辑处理
>2. 寄存器：Cpu中的一小块存储部件，可以用来暂存指令，数据和地址。它的容量很小，cpu执行时会根据寄存器中的地址对内存中的数据进行读取或回写。寄存器和内存的关系就类似内存和硬盘的关系。
>3. **工作内存**：每条线程都有自己的工作内存，工作内存中保存的是主存中某些变量的拷贝，线程对变量的所有操作都必须在工作内存中进行，而不能直接读写主内存中的变量。.线程之间无法直接访问对方的工作内存中的变量，线程间变量的传递均需要通过主内存来完成。线程安全问题由此而来。
>4. 自旋锁，java中的线程阻塞和唤醒是需要时间的。如果同步块中的代码很简单，可能CPU状态切换的时间比执行同步逻辑的时间还要久。自旋锁的设计思想就是：在多CPU中，当线程执行到加锁段时，如果发现未释放锁，自己不会放弃CPU时间，进入循环状态等待锁释放。适应性自旋锁:就是升级版的自旋锁，系统会根据上次线程获取到锁的时间等因素自动适配自旋时间。
>5. 无锁，偏向锁，轻量级锁，重量级锁。这些都是JVM在处理synchronized代码块时的一种处理过程。java对象里面除了数据，还有一部分叫对象头。在hotspot类型的JVM中对象头包含两部分数据：Mark Word（标记字段）、Klass Pointer（类型指针）。Mark Word：默认存储对象的HashCode，分代年龄和锁标志位信息。这些信息都是与对象自身定义无关的数据。其中的锁标志就会对应上面的4中状态，依次使用00，00，01，1标识锁等级。Klass Point：用于标记这个对象属于哪个类。
CAS就是基于无锁的概念来实现的。当一个线程访问到同步代码块并获得锁的时候Mark Word会记录该线程ID，因为系统认为接下来该线程还会再次访问。此时的锁标记就称为偏向锁。当A线程持有锁，B线程访问时会使用自旋的形式试图获取到锁，此时B线程不会阻塞。此时对象锁标记会升级为轻量锁。B线程继续自旋。当B线程自旋一定次数，或者在A占有锁，B自旋的同时又来个C线程试图访问，此时的锁标志就会升级为重量级锁。
在JDK1.6以前的synchronized都是重量级锁，1.6以后就是才用这种升级逻辑，这个锁级别是不需要我们管的，JVM会自动处理.
>6. 公平锁和非公平锁，可重入锁和非重入锁。
先说重入锁和非重入锁。因为java允许在线程中开启线程。假设A线程中再次开启A1线程，此时A1持有锁。如果此时出现线程切换。A会因为A1未释放锁而导致A无法执行，但是A不执行又无法唤醒A1。这样就会出现线程死锁。不过常用的synchronized默认就是重入锁。java.util.concurrent.locks下的ReentrantLock也是可重入锁。
公平锁和非公平锁：公平锁是指多个线程按照申请锁的顺序来获取锁，没有获取到的线程直接进入队列中排队，而每次唤醒时也从队列头部唤醒线程。非公平锁是如果多个线程申请锁，如果刚好锁被释放，则直接给当前线程，而不是去队列头部唤醒线程。没有获取到锁的依然要去排队。
java.util.concurrent.locks下的ReentrantLock默认是非公平锁，但是构造方法提供boolean fair 来构建公平锁。感觉非公平锁比较实用。
>7. 独享锁 和 共享锁
独享锁也叫排他锁，是指该锁一次只能被一个线程所持有。获得锁的线程可以读取和修改数据，其他线程不能访问，synchronized默认就是这种锁。
共享锁是指该锁可被多个线程所持有。获取到写锁的线程才能执行写操作，其他线程都只是读操作。因此独享锁和共享锁其实是一个概念。他们分属ReentrantReadWriteLock中的两个内部实现。
##### 天上飞的概念必定需要有落地的实现，下面是一些常用的API调用。上面提过的CountDownLatch和线程池也属于其中的一部分。
>1. 场景一、使用Callable和Future获取线程执行返回值。通常情况下创建的线程在主线程中是无法拿到返回值的，也无法知道子线程何时执行完毕。通过Callable和Future能很好的解决这个问题
```java
package com.example.demo.callableAndFuture;

import java.util.Random;
import java.util.concurrent.*;

/**
 * @Author: hcy
 * @Date: 2019/9/4 9:49
 * Callable我第一次接触是在android中遇到的，当时需要在相机调用后获取到图片数据，我还以为Callable是android提供的呢
 */
public class CallableAndFuture {


    public static void main(String[] args) {
        //调用下面的test...方法
    }
    //版本1
    private void test1(){
        //创建回调对象，再回调对象中执行逻辑。
        Callable<Integer> callable = new Callable<Integer>() {
            @Override
            public Integer call() throws Exception {
                System.out.println("子线程进入休眠状态");
                Thread.sleep(5000);
                return new Random().nextInt(100);//要做的事情
            }
        };
        //创建一个FutureTask对象，构造方法中要求传入一个callable对象，这样回调和结果就形成了一个绑定关系
        FutureTask<Integer> futureTask = new FutureTask<Integer>(callable);
        //开启一个线程执行方法，FutureTask本身也实现了Runnable接口
        new Thread(futureTask).start();
        try {
            //模拟主线程去做自己的事情了。做完后要获取到 回调线程中的逻辑返回结果
            System.out.println("主线程执行");
            Thread.sleep(1000);
            try {
                //获取到子线程的返回结果，这是是阻塞操作，主线程会再这里等待子线程的返回值
                System.out.println( futureTask.get() );
            } catch (ExecutionException e) {
                e.printStackTrace();
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
    //通过concurrent包下的线程池操作简化回调函数的创建和调用，其实就是对test1的简化
    private void test2(){
        //通过 concurrent包下的Executors创建一个线程池
        ExecutorService threadPool = Executors.newSingleThreadExecutor();
        // 通过内部类创建Callable对象执行业务逻辑，将业务逻辑提交给线程池，返回一个future对象
        Future<Integer> future = threadPool.submit(new Callable<Integer>() {
            @Override
            public Integer call() throws Exception {
                return new Random().nextInt(100);
            }
        });
        try {
            //再主线程中获取到子线程执行后的结果
            System.out.println( future.get() );
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }
    }

    //对test2的方法进一步改良。在主线程中接收多个线程的返回值，返回值会按完成时间顺序来排列返回
    private void test3(){
        ExecutorService threadPool = Executors.newCachedThreadPool();
        // CompletionService 也是concurrent包下的一个接口，用于保存一组异步任务的执行结果
        //通过 cs.take().get() 获取到线程的返回结果
        CompletionService<Integer> cs = new ExecutorCompletionService<Integer>(threadPool);
        for ( int i=1;i<5;i++ ){
            final int taskId =i;
            cs.submit(new Callable<Integer>() {
                @Override
                public Integer call() throws Exception {
                    Thread.sleep(100);
                    return taskId;
                }
            });
        }
        for (int i=1;i<5;i++){
            try {
                
                System.out.println( cs.take().get() );
            } catch (InterruptedException e) {
                e.printStackTrace();
            } catch (ExecutionException e) {
                e.printStackTrace();
            }
        }
    }
}
```
>2.场景二、使用Semaphore控制多线程对共同资源库的访问限制。比如停车场，100个位置，我最多只能允许100人进入，满员后出一个才能在进一个
```java
package com.example.demo.semaphore;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.concurrent.Semaphore;

/**
 * @Author: hcy
 * @Date: 2019/9/4 14:48
 * acquire()和release()就是要加锁的段，最多允许100个线程访问，满员后一个执行完毕后下一个线程才能继续执行。
 * acquire()和release()，占用和释放不相等的场景也有，比如主线程进入后子线程需要经过多个操作来分别释放占用量的情况
 */
public class SemaphoreService {
    private static SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");
    //这里的数值决定了同一时刻允许同时运行定制代码的线程数。构造函数可以传入两个参数int permits , boolean isFair。isFair决定锁的公平性，
    // true时先启动的线程先执行。permits决定允许同时进入的最大线程数，值为1时它的效果和synchronized差不多，只是它控制的更加细腻
    private Semaphore semaphore = new Semaphore(100);

    public void doSomething(){
        try {
            //semaphore 的 acquire()方法和release()之间的代码就是需要加以限制的代码段.
            //构造函数中的值决定了一次访问时占用的信号量，无参时一次占用一个信号量，release()方法会释放许可数量
            //当许可数量为0时，其他线程将进入阻塞状态
            semaphore.acquire(2);
            System.out.println( Thread.currentThread().getName() + ":doSomething start-"+getFormatTimeStr() );
            Thread.sleep(1000);
            System.out.println( Thread.currentThread().getName() + ":doSomething end-  "+getFormatTimeStr() );
            System.out.println("执行第一个操作，释放一个信号量");
            semaphore.release(1);
            System.out.println("执行第二个操作，在释放一个信号量");
            semaphore.release(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }finally {
            semaphore.release(2);
        }
    }

    public static String getFormatTimeStr(){
        return sdf.format(new Date());
    }
}
```
>3.使用ReentrantLock实现加锁和中断。ReentrantLock和synchronized实现的锁效果差不多，都输入可重入的独占锁。区别是ReentrantLock更加灵活，并且支持中断操作。可以认为它就是升级版的synchronized
```java
package com.example.demo.reentrantLock;

import java.util.concurrent.locks.ReentrantLock;

/**
 * @Author: hcy
 * @Date: 2019/9/4 16:06
 */
public class Test1 {
    public static void main(String[] args) {
        ReentrantLock lock = new ReentrantLock();

        for ( int i=0;i<10;i++ ){
            Thread t1 = new Thread(()->{
                lock.lock();
                //lock.lock();//锁和解锁次数要一致，不然会出现后续线程无法继续获得锁的情况。
                //处于lock() 和 unlock()间的代码段就是要被加锁的部分
                System.out.println("线程"+Thread.currentThread().getName()+"开始执行");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println("线程"+Thread.currentThread().getName()+"执行结束");
                lock.unlock();
            });
            t1.setName(i+"");
            t1.start();
            //  多个ReentrantLock可以嵌套加锁，允许第一个锁执行完后调用interrupt()方法中断后面的逻辑
            t1.interrupt();
        }
    }
}
```
>4.使用CyclicBarrier实现多次线程同步。例如聚会吃饭，一群人会在不同的时间出发但是需要再饭店门口集合，人齐了才进去开始点菜。先吃完的人要等待其他人吃完后才开始结账，这样就会存在需要多次线程同步
```java
package com.example.demo.cyclicBarrier;

import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;

/**
 * @Author: hcy
 * @Date: 2019/9/5 12:36
 * CyclicBarrier 可以认为是升级版的CountDownLatch
 * CyclicBarrier 有两个构造方法，单int parties 表示要参与的线程数
 * 双参数int parties, Runnable barrierAction，第一个参数为可以参与的线程数，
 * 第二个参数为每一轮线程同步时最后一个到达的线程再执行完后需要执行的额外的逻辑。
 * 例如最后吃完饭的人付账
 */
public class Test1 {

    public static void main(String[] args) {
        int threadCount = 3;
        CyclicBarrier cyclicBarrier = new CyclicBarrier(threadCount);
        for (int i=0;i<threadCount;i++){
            System.out.println("创建工作线程" + i);
            Worker worker = new Worker(cyclicBarrier);
            worker.start();
        }
    }

    private void demo2(){
        int threadNum = 5;
        CyclicBarrier cyclicBarrier = new CyclicBarrier(threadNum, new Runnable() {
            @Override
            public void run() {
                //最后一个到达的线程要做的事情，例如每次同步等待时聚会组织者都要清点人数
            }
        });
        for (int i=0;i<threadNum;i++){
            System.out.println("创建工作线程" + i);
            Worker worker = new Worker(cyclicBarrier);
            worker.start();
        }
    }
}


class Worker extends Thread{
    private CyclicBarrier cyclicBarrier;

    public Worker(CyclicBarrier _cyclicBarrier){
        this.cyclicBarrier = _cyclicBarrier;
    }
    @Override
    public void run() {
        super.run();
        try {
            System.out.println( Thread.currentThread().getName()+" 用户准备去吃饭的路上 ");
            Thread.sleep(1000);//模拟正在来的路上
            cyclicBarrier.await();//用户会先后到达，在饭店门口等着。等人齐了以后再一起进去
            System.out.println(Thread.currentThread().getName() +"我们进去吧,点菜吃饭");
            Thread.sleep(2000);//吃饭中
            cyclicBarrier.await();//用户不可能同时吃饱，先吃完的等后吃完的再一起离开
            System.out.println(Thread.currentThread().getName() +"吃完了，一起离开吧");
            cyclicBarrier.await();//等待人齐
            System.out.println(Thread.currentThread().getName() + "各回各家");
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (BrokenBarrierException e) {
            e.printStackTrace();
        }
    }
}
```
>5. 使用Exchanger解决线程间数据交换的问题。例如生产者和消费者间交换任务
```java
package com.example.demo.cyclicBarrier;

import java.util.concurrent.Exchanger;
import java.util.concurrent.TimeUnit;

/**
 * @Author: hcy
 * @Date: 2019/9/5 18:09
 */
public class TestExchanger {
    public static void main(String[] args) throws InterruptedException {
        //创建交换者
        Exchanger<Integer> exchanger = new Exchanger<>();
        //创建线程，并将Exchanger对象传入，这样两个线程间就形成了绑定关系
        new Producer("",exchanger).start();
        new Consumer("", exchanger).start();
    }

}

class Producer extends Thread{
    //泛型决定可以交换的数据类型
    private Exchanger<Integer> exchanger;
    private static int data = 0;
    Producer(String name,Exchanger<Integer> changer){
        super("Producer-"+name);
        this.exchanger = changer;
    }

    @Override
    public void run() {
        for ( int i=1;i<5;i++ ){
            try {
                //TimeUnit 是concurrent包下提供的工具类，这句话的作用类似 Thread.sleep(1000);
                TimeUnit.SECONDS.sleep(1);
                data = i;//为data赋值
                System.out.println( getName() +"交换前："+data);
                data = exchanger.exchange(data);//数据交换，将自己的值给别的线程，同时将别的线程的值给自己
                System.out.println( getName()+" 交换后:" + data );
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
class Consumer extends Thread {
    private Exchanger<Integer> exchanger;
    private static int data = 0;
    Consumer(String name, Exchanger<Integer> exchanger) {
        super("Consumer-" + name);
        this.exchanger = exchanger;
    }

    @Override
    public void run() {
        while (true) {
            data = 0;
            System.out.println(getName()+" 交换前:" + data);
            try {
                TimeUnit.SECONDS.sleep(1);
                data = exchanger.exchange(data);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println(getName()+" 交换后:" + data);
        }
    }
}
```
#### 2019-11-14
```java
//并发包下的常用数据容器
@Test
public void testCopyOnWriteArrayList(){
    //高性能的list，对读环节不加锁，只有写操作才加锁，性能高于Vector
    CopyOnWriteArrayList copy = new CopyOnWriteArrayList();
    copy.add("aa");
    System.out.println(  copy.toString());
    //高并发中性能最好的非阻塞队列，通过复杂的CAS非阻塞算法实现，会用就好
    ConcurrentLinkedDeque<String > deque = new ConcurrentLinkedDeque<>();
    deque.push("aa");
    System.out.println( deque.toString() );
    //所有实现自BlockingQueue接口的都是阻塞队列，通常用于“生产者-消费者”问题中。当队列容器已满，生产者线程会被阻塞；当队列容器为空时，消费者线程会被阻塞
    //ArrayBlockingQueue 属于BlockingQueue下的有界队列.第二个参数控制公平性，即最先等待的线程能够最先访问到 ArrayBlockingQueue
    ArrayBlockingQueue blockingQueue = new ArrayBlockingQueue(10,true);
    //理论上的无界阻塞队列，使用单向链表。为了防止无界带来的大量内存消耗，其构造方法中在不指定大小时会默认容量为Integer.MAX_VALUE。
    LinkedBlockingQueue linkedBlockingQueue = new LinkedBlockingQueue(10);
    //支持优先级队列，元素必须实现comparable接口，按大小排序。但是它不是线程安全的。
    PriorityQueue priorityQueue = new PriorityQueue();
    //支持优先级的无界阻塞队列，可以认为它是线程安全的priorityQueue，初始化时如果指定了容量，后面空间不够时会自动扩容
    PriorityBlockingQueue priorityBlockingQueue = new PriorityBlockingQueue();
    //有序的线程安全map，内部使用跳表数据结构，查询速度大于链表，且数据变化时不会像平衡树那样导致全局数据调整。但是耗费空间较大。
    ConcurrentSkipListMap concurrentSkipListMap = new ConcurrentSkipListMap();
}
```