using System.Text.Json;
using System.Text.Json.Serialization;

namespace MythosGraph.Api.Serialization;

public sealed class FlexibleJsonStringEnumConverter : JsonConverterFactory
{
    public override bool CanConvert(Type typeToConvert)
    {
        return typeToConvert.IsEnum;
    }

    public override JsonConverter CreateConverter(Type typeToConvert, JsonSerializerOptions options)
    {
        var converterType = typeof(FlexibleEnumConverter<>).MakeGenericType(typeToConvert);
        return (JsonConverter)Activator.CreateInstance(converterType)!;
    }

    private sealed class FlexibleEnumConverter<TEnum> : JsonConverter<TEnum>
        where TEnum : struct, Enum
    {
        public override TEnum Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Number && reader.TryGetInt32(out var numericValue))
            {
                return (TEnum)Enum.ToObject(typeof(TEnum), numericValue);
            }

            if (reader.TokenType != JsonTokenType.String)
            {
                throw new JsonException($"Expected string or number for enum {typeof(TEnum).Name}.");
            }

            var value = reader.GetString();
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new JsonException($"Expected non-empty value for enum {typeof(TEnum).Name}.");
            }

            if (int.TryParse(value, out numericValue))
            {
                return (TEnum)Enum.ToObject(typeof(TEnum), numericValue);
            }

            var normalizedValue = Normalize(value);
            foreach (var name in Enum.GetNames<TEnum>())
            {
                if (Normalize(name) == normalizedValue)
                {
                    return Enum.Parse<TEnum>(name);
                }
            }

            throw new JsonException($"Value '{value}' is not valid for enum {typeof(TEnum).Name}.");
        }

        public override void Write(Utf8JsonWriter writer, TEnum value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.ToString());
        }

        private static string Normalize(string value)
        {
            return value
                .Replace("_", string.Empty, StringComparison.Ordinal)
                .Replace("-", string.Empty, StringComparison.Ordinal)
                .Replace(" ", string.Empty, StringComparison.Ordinal)
                .ToLowerInvariant();
        }
    }
}
