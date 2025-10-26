package com.logindemo.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger配置类 - SpringDoc版本
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("登录系统API文档")
                        .description("通用登录系统的API接口文档")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("LoginDemo")
                                .email("")));
    }
}
