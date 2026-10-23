package com.company.mono;

import com.company.mono.common.security.JwtProperties;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

/**
 * 模块化单体唯一启动类：所有模块打进同一个 jar，一起部署。
 */
@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
@MapperScan({"com.company.mono.system.mapper", "com.company.mono.order.mapper"})
public class CompanyMonoApplication {

    public static void main(String[] args) {
        SpringApplication.run(CompanyMonoApplication.class, args);
    }
}
