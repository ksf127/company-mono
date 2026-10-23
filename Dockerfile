# ===== 构建阶段 =====
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

# 先复制 pom 以复用依赖层缓存
COPY pom.xml .
RUN mvn -B -ntp -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -B -ntp -DskipTests package

# ===== 运行阶段 =====
FROM eclipse-temurin:17-jre
WORKDIR /app

# 使用非 root 用户运行，降低容器风险
RUN groupadd --system app && useradd --system --gid app app
COPY --from=build /build/target/company-mono-1.0.0-SNAPSHOT.jar /app/app.jar
RUN chown -R app:app /app
USER app

ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:MaxRAMPercentage=75.0"

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
